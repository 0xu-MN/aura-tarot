import React, { type PropsWithChildren } from 'react';
import { View } from 'react-native';
import { AppsInToss } from '@apps-in-toss/framework';
import { type InitialProps } from '@granite-js/react-native';
import { TDSProvider } from '@toss/tds-react-native';
import { AuthProvider } from '../context/AuthContext';
import { context } from '../require.context';

import { AlertProvider } from '../components/AlertProvider';
import { AppTabNavigator } from '../components/navigation/AppTabNavigator';

function AppContainer({ children }: PropsWithChildren<InitialProps>) {
  return (
    <TDSProvider>
      <AuthProvider>
        <AlertProvider>
          {children}
        </AlertProvider>
      </AuthProvider>
    </TDSProvider>
  );
}

export default AppsInToss.registerApp(AppContainer, { context });
