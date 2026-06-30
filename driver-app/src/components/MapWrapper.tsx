import React from 'react';
import {
  StyleSheet,
  Text,
  UIManager,
  View,
  type StyleProp,
  type ViewStyle
} from 'react-native';
import ReactNativeMapView, { Marker as ReactNativeMarker, Polyline as ReactNativePolyline } from 'react-native-maps';

const isNativeMapAvailable =
  typeof UIManager.getViewManagerConfig === 'function' &&
  Boolean(UIManager.getViewManagerConfig('AIRMap'));

type FallbackMapProps = {
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
};

const FallbackMapView = ({ style }: FallbackMapProps) => (
  <View style={[styles.fallbackMap, style]}>
    <Text style={styles.fallbackTitle}>Live map unavailable in this build.</Text>
    <Text style={styles.fallbackText}>
      Rebuild the driver app with the native map module enabled to render the full map.
    </Text>
  </View>
);

const FallbackMarker = () => null;
const FallbackPolyline = () => null;

const MapView = (isNativeMapAvailable ? ReactNativeMapView : FallbackMapView) as typeof ReactNativeMapView;
export const Marker = (isNativeMapAvailable ? ReactNativeMarker : FallbackMarker) as typeof ReactNativeMarker;
export const Polyline = (isNativeMapAvailable ? ReactNativePolyline : FallbackPolyline) as typeof ReactNativePolyline;
export default MapView;

const styles = StyleSheet.create({
  fallbackMap: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 8
  },
  fallbackTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center'
  },
  fallbackText: {
    fontSize: 14,
    lineHeight: 21,
    color: '#475569',
    textAlign: 'center'
  }
});
