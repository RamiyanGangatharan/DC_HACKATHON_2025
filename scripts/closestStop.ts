import { useEffect } from 'react';
interface Stop {
    stopID: string;
    latitude: number;
    longitude: number;
}
import * as FileSystem from 'expo-file-system';
import * as Asset from 'expo-asset';
import * as SQLite from 'expo-sqlite';
export const copyStopsFile = async () => {
  try {
    const asset = require('../static/stops.csv'); // Adjust the path to your stops.csv file
    const fileUri = FileSystem.documentDirectory + 'stops.csv';

    // Check if the file already exists
    const fileExists = await FileSystem.getInfoAsync(fileUri);
    if (fileExists.exists) {
      console.log('stops.csv already exists in the document directory');
      return;
    }

    // Download the file to the document directory
    await FileSystem.downloadAsync(asset.uri, fileUri);
    console.log('stops.csv copied to document directory');
  } catch (error) {
    console.error('Error copying stops.csv file:', error);
  }
};

const getStopsData = async (): Promise<string | null> => {
  try {
    const fileUri = FileSystem.documentDirectory + 'stops.csv'; // Path to the local file
    console.log('Reading stops.csv from:', fileUri);

    const data = await FileSystem.readAsStringAsync(fileUri);
    console.log('Stops data read successfully:', data);
    return data;
  } catch (error) {
    console.error('Error reading stops.csv file:', error);
    return null;
  }
};
// Function to calculate the distance between two coordinates using the Haversine formula
function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const toRadians = (degrees: number) => degrees * (Math.PI / 180);
    const R = 6371; // Radius of the Earth in kilometers

    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lat2 - lat1);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in kilometers
}

// Function to find the closest stop from CSV data
export async function findClosestStop(data: string, targetLat: number, targetLon: number): Promise<Stop | null> {
    const lines = data.split('\n'); // Split the CSV data into lines
    let closestStop: Stop | null = null;
    let minDistance = Infinity;

    for (const line of lines) {
        // Skip the header row
        if (line.startsWith('stop_id')) continue;

        // Parse the CSV columns
        const [stop_id, , , , stop_lat, stop_lon] = line.split(',');

        if (!stop_id || !stop_lat || !stop_lon) continue;

        const lat = parseFloat(stop_lat);
        const lon = parseFloat(stop_lon);

        const distance = haversineDistance(targetLat, targetLon, lat, lon);

        if (distance < minDistance) {
            minDistance = distance;
            closestStop = { stopID: stop_id, latitude: lat, longitude: lon };
        }
    }

    return closestStop;
}

// Function to fetch the CSV file and find the closest stop
export const findClosest = async function (targetLat: number, targetLon: number): Promise<Stop | null> {
  try {
    const data = await getStopsData(); // Fetch the stops data
    if (!data) {
      throw new Error('Stops data is empty or could not be read');
    }

    return await findClosestStop(data, targetLat, targetLon); // Find the closest stop
  } catch (error) {
    console.error('Error fetching or processing the stops.csv file:', error);
    return null;
  }
};
