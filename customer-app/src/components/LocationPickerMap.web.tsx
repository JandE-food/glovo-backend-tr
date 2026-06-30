import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { Coordinates } from '../types/models';

type Props = {
  coordinates: Coordinates;
  onChange: (coordinates: Coordinates) => void;
};

export const LocationPickerMap = ({ coordinates }: Props) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Map picker is not available on web.</Text>
      <Text style={styles.subtitle}>
        Saved coordinates: {coordinates.latitude.toFixed(5)}, {coordinates.longitude.toFixed(5)}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 240,
    borderRadius: 20,
    backgroundColor: '#EEF2F7',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    textAlign: 'center'
  },
  subtitle: {
    marginTop: 8,
    fontSize: 14,
    color: '#475569',
    textAlign: 'center'
  }
});
