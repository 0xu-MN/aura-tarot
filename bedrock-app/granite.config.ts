import { appsInToss } from '@apps-in-toss/plugins';
import { router } from '@granite-js/plugin-router';
import { defineConfig } from '@granite-js/react-native/config';

export default defineConfig({
  appName: 'ai-today-one-card',
  scheme: 'ai-today-one-card',
  plugins: [
    router(),
    ...appsInToss({
      brand: {
        displayName: '오늘의 한장 타로',
        primaryColor: '#DAA520',
        icon: 'https://via.placeholder.com/150',
      },
      permissions: [],
    }),
  ],
});
