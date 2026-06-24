import React from 'react';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { StyleSheet } from 'react-native';

type Coordinate = { latitude: number; longitude: number };

type Props = {
  initialRegion: any;
  restaurantCoordinate: Coordinate;
  restaurantTitle: string;
  customerCoordinate: Coordinate;
  customerTitle: string;
  driverMarker: Coordinate | null;
  driverTitle: string;
  polylineCoordinates: Coordinate[];
  primaryColor: string;
};

export const OrderMap = ({
  initialRegion,
  restaurantCoordinate,
  restaurantTitle,
  customerCoordinate,
  customerTitle,
  driverMarker,
  driverTitle,
  polylineCoordinates,
  primaryColor
}: Props) => {
  return (
    <MapView style={styles.map} initialRegion={initialRegion}>
      <Marker coordinate={restaurantCoordinate} title={restaurantTitle} />
      <Marker coordinate={customerCoordinate} title={customerTitle} />
      {driverMarker ? <Marker coordinate={driverMarker} title={driverTitle} /> : null}
      <Polyline coordinates={polylineCoordinates} strokeColor={primaryColor} strokeWidth={4} />
    </MapView>
  );
};

const styles = StyleSheet.create({
  map: {
    width: '100%',
    height: 320
  }
});
