import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const MapView = ({ children, style, ...props }: any) => {
  return (
    <View style={[style, styles.container]}>
      <Text style={styles.text}>Map not supported on Web</Text>
      <View style={{ display: 'none' }}>{children}</View>
    </View>
  );
};

export const Marker = () => null;
export const Polyline = () => null;
export default MapView;

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#e5e5e5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: '#666',
    fontWeight: 'bold',
  }
});
