import { appsInToss } from '@apps-in-toss/plugins';
import { router } from '@granite-js/plugin-router';
import { defineConfig } from '@granite-js/react-native/config';

export default defineConfig({
  appName: 'ai-today-one-card',
  scheme: 'intoss',
  plugins: [
    router(),
    ...appsInToss({
      appType: 'general',
      brand: {
        displayName: '오늘의 한 장',
        primaryColor: '#DAA520',
        icon: 'https://i.imgur.com/IuK1vAi.jpg',
      },
      permissions: [
        { name: 'camera', access: 'access' },
        { name: 'photos', access: 'read' },
        { name: 'geolocation', access: 'access' },
      ],
      navigationBar: {
        withBackButton: true,
      },
    }),
  ],
});

