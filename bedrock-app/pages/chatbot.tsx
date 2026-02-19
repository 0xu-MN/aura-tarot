import React from 'react';
import { Text, View } from 'react-native';
import { createRoute } from '@granite-js/react-native';

export const Route = createRoute('/chatbot', {
  validateParams: (params) => params,
  component: Chatbot,
});

function Chatbot() {
  return (
    <View>
      <Text>Hello Chatbot</Text>
    </View>
  );
}
