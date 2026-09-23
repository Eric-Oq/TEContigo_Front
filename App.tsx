import './global.css';
import { useState } from 'react';
import { AuthProvider, useAuth } from './src/AuthContext';
import { LoginScreen } from './src/LoginScreen';
import { RegisterScreen } from './src/RegisterScreen';
import { MainNavigator } from './src/MainNavigator';

const RootNavigator = () => {
  const { currentUser } = useAuth();
  // Estado para saber qué pantalla mostrar si no hay usuario
  const [isLoginView, setIsLoginView] = useState(true);
  
  // Si existe un usuario activo, muestra la app principal
  if (currentUser) {
    return <MainNavigator />;
  }

  // Si no hay usuario, alterna entre Login y Registro
  return isLoginView ? (
    <LoginScreen onNavigateToRegister={() => setIsLoginView(false)} />
  ) : (
    <RegisterScreen onNavigateToLogin={() => setIsLoginView(true)} />
  );
};

export default function App() {
  return (
    <AuthProvider>
      <RootNavigator />
    </AuthProvider>
  );
}