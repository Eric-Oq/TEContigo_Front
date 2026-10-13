// src/api/client.ts
import { API_BASE_URL, REQUEST_TIMEOUT_MS } from '../../config/api';

export class ApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  token?: string | null;
}

export async function request<T>(
  path: string,
  { method = 'GET', body, token }: RequestOptions = {}
): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let response: Response;
  const isMultipart = typeof FormData !== 'undefined' && body instanceof FormData;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers: {
        ...(!isMultipart ? { 'Content-Type': 'application/json' } : {}),
        Accept: 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body:
        body === undefined
          ? undefined
          : isMultipart
            ? body
            : JSON.stringify(body),
      signal: controller.signal,
    });
  } catch {
    // Sin red, servidor apagado, timeout o URL base incorrecta.
    throw new ApiError(
      'No se pudo conectar al servidor. Revisa tu conexión e inténtalo de nuevo.',
      0
    );
  } finally {
    clearTimeout(timeoutId);
  }

  const raw = await response.text();
  let data: any = null;

  if (raw) {
    try {
      data = JSON.parse(raw);
    } catch {
      data = null;
    }
  }

  if (!response.ok) {
    throw new ApiError(extractErrorMessage(data, response.status), response.status);
  }

  return data as T;
}

function extractErrorMessage(data: any, status: number): string {
  // Formato de tu middleware global: { success: false, message }
  if (data?.message) {
    return data.message;
  }

  // Errores automáticos de ASP.NET al leer el JSON (ProblemDetails con "errors").
  if (data?.errors) {
    return 'Revisa los datos ingresados e inténtalo de nuevo.';
  }

  // El middleware de JWT responde 401/403 sin cuerpo.
  if (status === 401) {
    return 'Tu sesión expiró. Inicia sesión de nuevo.';
  }

  if (status === 403) {
    return 'No tienes permiso para realizar esta acción.';
  }

  return 'Ocurrió un error inesperado. Inténtalo de nuevo.';
}