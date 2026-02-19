import React, { type PropsWithChildren } from 'react';
import { Granite, type InitialProps } from '@granite-js/react-native';
import { context } from '../require.context';
import { AuthProvider } from '../contexts/AuthContext';

function AppContainer({ children }: PropsWithChildren<InitialProps>) {
  return <AuthProvider>{children}</AuthProvider>;
}

export default Granite.registerApp(AppContainer, {
  appName: 'ai-today-one-card',
  context,
});
