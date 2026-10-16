import './global.css';
import React, { useState } from 'react';
import { AuthProvider, useAuth } from './src/AuthContext';
import { MainNavigator } from './src/components/MainNavigator';
import { RegisterScreen } from './src/modules/auth/RegisterScreen';
import { VerifyEmailScreen } from './src/modules/auth/VerifyEmailScreen';
import { LoginScreen } from './src/modules/auth/LoginScreen';

type AuthScreen =
  | { name: 'login' }
  | { name: 'register' }
  | { name: 'verifyEmail'; email: string };

function RootNavigator() {
  const [screen, setScreen] = useState<AuthScreen>({ name: 'login' });
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <MainNavigator />;
  }

  switch (screen.name) {
    case 'register':
      return (
        <RegisterScreen
          onNavigateToLogin={() => setScreen({ name: 'login' })}
          onRegistered={(email) => setScreen({ name: 'verifyEmail', email })}
        />
      );

    case 'verifyEmail':
      return (
        <VerifyEmailScreen
          email={screen.email}
          onVerified={() => setScreen({ name: 'login' })}
          onBack={() => setScreen({ name: 'register' })}
        />
      );

    default:
      return (
        <LoginScreen onNavigateToRegister={() => setScreen({ name: 'register' })} />
      );
  }
}

export default function App() {
  return (
    <AuthProvider>
      <RootNavigator />
    </AuthProvider>
  );
}