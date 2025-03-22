import { Image, StyleSheet, Button,
  Platform, SafeAreaView, PermissionsAndroid, View, Text } from 'react-native';
import Geolocation from 'react-native-geolocation-service';
import { useEffect, useState, useRef } from 'react';
import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import MapView from 'react-native-maps';
import { ScrollView } from 'react-native';
import  useAppTheme  from './_layout';
export default function HomeScreen() {
  const defaultLocation = { latitude: 43.944033, longitude: -78.895080 };
  const [location, setLocation] = useState<{ latitude: number; longitude: number }>({
    latitude: defaultLocation.latitude, 
    longitude: defaultLocation.longitude, 
  });


  const mapRef = useRef<MapView>(null); // Reference to the MapView

  const requestLocationPermission = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION

      );
      Geolocation.getCurrentPosition(
        (position) => {
          const newLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
          setLocation(newLocation);
  
          // Animate the map to the new location
          mapRef.current?.animateToRegion({
            ...newLocation,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          });
        },
        (error) => {
          console.error(error);
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
      );
      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        console.warn('Location permission denied');
        return;
      }
    }
    
  };

  useEffect(() => {
    requestLocationPermission();
  }, []); 

  return (
    <SafeAreaView style={styles.container}>
      <MapView 
        ref={mapRef}
        initialRegion={{
          ...location,
          latitudeDelta: defaultLocation.latitude,
          longitudeDelta: 0.01,
        }}
        style={styles.map} 
      />
      <View style={styles.buttonContainer}>
        <Button title="Zoom In" onPress={requestLocationPermission} />
      </View>
      <Button title="Reset" onPress={requestLocationPermission}/>
      <ScrollView>
      <View>
        <Text>905 bus arriving at this time</Text>
      </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: Platform.OS === 'android' ? 100 : 0,
    paddingLeft: Platform.OS === 'android' ? 25 : 0,
    paddingRight: Platform.OS === 'android' ? 25 : 0,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
  map: {
    width: '100%',
    height: '80%',
  },
  buttonContainer: {
    position: 'absolute',
    top: 10, // Adjust the position as needed
    right: 10, // Adjust the position as needed
    backgroundColor: 'rgba(255, 255, 255, 0.8)', // Semi-transparent background
    borderRadius: 8,
    padding: 5,
  },
});
