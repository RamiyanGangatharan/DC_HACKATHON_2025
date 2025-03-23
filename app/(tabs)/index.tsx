import React, { useEffect, useState, useRef } from 'react';
import {
  Animated,
  StyleSheet,
  SafeAreaView,
  View,
  Text,
  ScrollView,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import Geolocation from 'react-native-geolocation-service';
import MapView, { Marker } from 'react-native-maps';
import { useAppTheme } from '../_layout';
import { findClosest } from '../../scripts/closestStop'; // Import the function

export default function HomeScreen() {
  const theme = useAppTheme();
  const defaultLocation = { latitude: 43.944033, longitude: -78.895080 };
  const [location, setLocation] = useState<{ latitude: number; longitude: number }>(defaultLocation);
  const [closestStop, setClosestStop] = useState<{ stopID: string; latitude: number; longitude: number } | null>(null); // State for closest stop
  const [focusedComponent, setFocusedComponent] = useState<'map' | 'scroll'>('map'); // Track focused component

  const mapRef = useRef<MapView>(null); // Reference to the MapView
  const mapHeight = useRef(new Animated.Value(0.8)).current; // Animated height for MapView
  const scrollHeight = useRef(new Animated.Value(0.2)).current; // Animated height for ScrollView

  const requestLocationPermission = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
      );
      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        console.warn('Location permission denied');
        return;
      }
    }

    Geolocation.getCurrentPosition(
      async (position) => {
        const newLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        setLocation(newLocation);

        // Find the closest stop
        const stop = await findClosest(newLocation.latitude, newLocation.longitude);
        console.log(stop);
        setClosestStop(stop);

        // Animate the map to the new location
        mapRef.current?.animateToRegion({
          ...newLocation,
          latitudeDelta: 0.001,
          longitudeDelta: 0.001,
        });
      },
      (error) => {
        console.error(error);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  };

  useEffect(() => {
    requestLocationPermission();
  }, []);

  // Animate height changes
  const animateHeights = (focused: 'map' | 'scroll') => {
    if (focused === 'map') {
      Animated.timing(mapHeight, {
        toValue: 6,
        duration: 500,
        useNativeDriver: false,
      }).start();
      Animated.timing(scrollHeight, {
        toValue: 0.2, // 20% height for ScrollView
        duration: 500,
        useNativeDriver: false,
      }).start();
    } else {
      Animated.timing(mapHeight, {
        toValue: 0.2, // 20% height for MapView
        duration: 500,
        useNativeDriver: false,
      }).start();
      Animated.timing(scrollHeight, {
        toValue: 0.8, // 80% height for ScrollView
        duration: 500,
        useNativeDriver: false,
      }).start();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View
        style={[
          styles.mapContainer,
          { flex: mapHeight }, // Use animated height for MapView
        ]}
        onTouchStart={() => {
          setFocusedComponent('map');
          animateHeights('map');
        }}
      >
        <MapView
          ref={mapRef}
          showsUserLocation={true}
          showsMyLocationButton={true}
          showsCompass={true}
          followsUserLocation={true}
          initialRegion={{
            ...location,
            latitudeDelta: 0.0005,
            longitudeDelta: 0.0005,
          }}
          style={{ flex: 1 }}
          
        >
          {/* Add a marker for the closest stop */}
          {closestStop && (
            <Marker
              coordinate={{
                latitude: closestStop.latitude,
                longitude: closestStop.longitude,
              }}
              title={closestStop.stopID}
              description="Closest Stop"
            />
          )}
        </MapView>
      </Animated.View>

      <Animated.ScrollView
        style={[
          { backgroundColor: theme.colors.tertiary },
          { flex: scrollHeight }, // Use animated height for ScrollView
        ]}
        onTouchStart={() => {
          setFocusedComponent('scroll');
          animateHeights('scroll');
        }}
      >
        <View style={styles.busContainer}>
          <View style={styles.rowContainer}>
            <Text style={[styles.busText, { color: theme.colors.primary }]}>905</Text>
            <Text style={[styles.statusText, { color: theme.colors.primary }]}>Bus Status: Operational</Text>
          </View>
        </View>
      </Animated.ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, // Ensure the container takes up the full screen
  },
  mapContainer: {
    width: '100%',
  },
  busText: {
    fontSize: 40,
    fontFamily: 'Helvetica',
    fontWeight: 'bold',
  },
  statusText: {
    fontSize: 16,
    marginLeft: 10, // Add spacing between the two texts
  },
  busContainer: {
    width: '100%',
    height: '50%',
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    marginTop: 20,
  },
  rowContainer: {
    height: 60,
    flexDirection: 'row', // Align items horizontally
    alignItems: 'center', // Vertically center the text
  },
});
