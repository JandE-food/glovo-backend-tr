import React, { useMemo } from 'react';
import MapView, { Marker } from 'react-native-maps';
import { StyleSheet } from 'react-native';

import type { Coordinates } from '../types/models';

type Props = {
  coordinates: Coordinates;
  onChange: (coordinates: Coordinates) => void;
};

export const LocationPickerMap = ({ coordinates, onChange }: Props) => {
  const region = useMemo(
    () => ({
      latitude: coordinates.latitude,
      longitude: coordinates.longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01
    }),
    [coordinates.latitude, coordinates.longitude]
  );

  const handleMapPress = (event: { nativeEvent: { coordinate: Coordinates } }) => {
    onChange(event.nativeEvent.coordinate);
  };

  const handleMarkerDragEnd = (event: { nativeEvent: { coordinate: Coordinates } }) => {
    onChange(event.nativeEvent.coordinate);
  };

  return (
    <MapView style={styles.map} region={region} onPress={handleMapPress}>
      <Marker coordinate={coordinates} draggable onDragEnd={handleMarkerDragEnd} title="Delivery location" />
    </MapView>
  );
};

const styles = StyleSheet.create({
  map: {
    width: '100%',
    height: 240
  }
});
