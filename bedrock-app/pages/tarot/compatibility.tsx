import React from 'react';
import { Text, View } from 'react-native';
import { createRoute } from '@granite-js/react-native';

export const Route = createRoute('/tarot/compatibility', {
  validateParams: (params) => params,
  component: TarotCompatibility,
});

function TarotCompatibility() {
  return (
    <View>
      <Text>Hello TarotCompatibility</Text>
    </View>
  );
}
