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
  Button,
} from 'react-native';
import Geolocation from 'react-native-geolocation-service';
import MapView, { Marker } from 'react-native-maps';
import { useAppTheme } from '../_layout';
import { findClosest, copyStopsFile  } from '../../scripts/closestStop'; // Import the findClosest function

interface Stop {
  stopID: string;
  latitude: number;
  longitude: number;
}
export default function HomeScreen() {
  const theme = useAppTheme();
  const defaultLocation = { latitude: 43.944033, longitude: -78.895080 };
  const [location, setLocation] = useState(defaultLocation);
  const [closestStop, setClosestStop] = useState<Stop | null>(null); // State for the closest stop
  const [focusedComponent, setFocusedComponent] = useState<'map' | 'scroll'>('map'); // Track focused component

  const mapRef = useRef<MapView>(null); // Reference to the MapView
  const mapHeight = useRef(new Animated.Value(0.8)).current; // Animated height for MapView
  const scrollHeight = useRef(new Animated.Value(0.2)).current; // Animated height for ScrollView

  const requestLocationPermission = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
      );

      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log('Location permission granted');
        moveToUserLocation();
      } else {
        console.warn('Location permission denied');
      }
    }
  };

  const moveToUserLocation = async () => {
    Geolocation.getCurrentPosition(
      async (position) => {
        const newLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        console.log('User location:', newLocation);
        setLocation(newLocation);

        // Animate the map to the user's current location
        mapRef.current?.animateToRegion({
          ...newLocation,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });

        // Find the closest stop
        const closest = await findClosest(newLocation.latitude, newLocation.longitude);
        console.log('Closest stop:', closest);
        setClosestStop(closest);
      },
      (error) => {
        console.error('Error getting location:', error);
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
  useEffect(() => {
    copyStopsFile();
  }, []);
  const getClosestStop = async () => {
    try {
      console.log('Fetching closest stop...');
      const closest = await findClosest(location.latitude, location.longitude);
      console.log('Closest stop:', closest);
      setClosestStop(closest);
    } catch (error) {
      console.error('Error finding closest stop:', error);
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
          initialRegion={{
            ...location,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }}
          style={{ flex: 1 }}
          showsUserLocation={true}
        >
          {/* Add a marker at the user's current location */}
          <Marker
            coordinate={location}
            title="Your Location"
            description="This is your current location."
          />

          {/* Add a marker for the closest stop */}
          {closestStop && (
            <Marker
              coordinate={{
                latitude: closestStop.latitude,
                longitude: closestStop.longitude,
              }}
              title="Closest Stop"
              description={`Stop ID: ${closestStop.stopID}`}
            />
          )}
        </MapView>
        <View style={styles.locationButtonContainer}>
          <Button
            title="Go to My Location"
            onPress={moveToUserLocation}
            color="black"
          />
        </View>
        <View style={styles.closestStopButtonContainer}>
          <Button
            title="Find Closest Stop"
            onPress={getClosestStop}
            color="blue" // Optional: Set button color
          />
        </View>
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
            <Text style={[styles.statusText, { color: theme.colors.primary }]}>
              Bus Status: Operational
            </Text>
          </View>
        </View>
      </Animated.ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mapContainer: {
    width: '100%',
  },
  locationButtonContainer: {
    position: 'absolute',
    bottom: 80, // Adjust position to avoid overlap with the new button
    right: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 5,
  },
  closestStopButtonContainer: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 5,
  },
  busText: {
    fontSize: 40,
    fontFamily: 'Helvetica',
    fontWeight: 'bold',
  },
  statusText: {
    fontSize: 16,
    marginLeft: 10,
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
    flexDirection: 'row',
    alignItems: 'center',
  },
});
