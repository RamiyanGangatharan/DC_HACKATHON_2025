import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';
import RNFS from 'react-native-fs';

interface Stop {
    stopID: string;
    latitude: number;
    longitude: number;
}

// Function to calculate the distance between two coordinates using the Haversine formula
function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const toRadians = (degrees: number) => degrees * (Math.PI / 180);
    const R = 6371; // Radius of the Earth in kilometers

    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lat1);

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
        const response = await fetch('../static/stops.csv'); // Adjust the path as needed
        const responseText = await response.text();
        return await findClosestStop(responseText, targetLat, targetLon);
    } catch (error) {
        console.error('Error fetching or processing the stops.csv file:', error);
        return null;
    }
};
