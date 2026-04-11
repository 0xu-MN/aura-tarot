import { createRoute } from '@granite-js/react-native';
import React from 'react';
import { LoungeView } from '../components/lounge/LoungeView';

export const Route = createRoute('/lounge', {
  component: LoungeView,
});
