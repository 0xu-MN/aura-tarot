import React from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';

// Direct test - can we load ONE image?
const testImage = require('./assets/tarot-cards/major_00.jpg');

export function TestImage() {
  console.log('Test image:', testImage);
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Testing Image Load:</Text>
      <Image 
        source={testImage}
        style={styles.image}
        onError={(e) => console.error('Image error:', e.nativeEvent.error)}
        onLoad={() => console.log('Image loaded successfully!')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#000', alignItems: 'center' },
  text: { color: '#fff', fontSize: 18, marginBottom: 10 },
  image: { width: 200, height: 350, borderWidth: 2, borderColor: '#DAA520' },
});
