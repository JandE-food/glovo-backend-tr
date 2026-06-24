import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const OrderMap = () => {
  return (
    <View style={styles.container}>
      <Text>Map is not supported on web.</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 320,
    backgroundColor: '#e1e4e8',
    justifyContent: 'center',
    alignItems: 'center'
  }
});
