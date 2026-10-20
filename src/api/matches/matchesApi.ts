import { request } from '../auth/client';
import type {
  Match,
  PagedResult,
  RequestChatResponse,
} from '../types';

export type { Match, RequestChatResponse } from '../types';

export const matchesApi = {
  getAll: (token: string, pageNumber = 1, pageSize = 10) =>
    request<PagedResult<Match>>(
      `/api/matches?pageNumber=${pageNumber}&pageSize=${pageSize}`,
      { token }
    ),

  getById: (id: number, token: string) =>
    request<Match>(`/api/matches/${encodeURIComponent(id)}`, { token }),

  requestChat: (id: number, token: string) =>
    request<RequestChatResponse>(
      `/api/matches/${encodeURIComponent(id)}/request-chat`,
      {
        method: 'POST',
        token,
      }
    ),
};
