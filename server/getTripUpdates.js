import express from 'express';
import dbConn from './connect.js';
import GtfsRealtimeBindings from 'gtfs-realtime-bindings';
import fetch from 'node-fetch';

const router = express.Router();

// URL for the GTFS-RT data
const GTFS_RT_URL = 'https://drtonline.durhamregiontransit.com/gtfsrealtime/TripUpdates';

// Function to fetch and save trip updates to MongoDB
const fetchAndSaveTripUpdates = async () => {
  try {
    console.log("Fetching trip updates...");

    // Fetch the GTFS-RT data from the online page
    const response = await fetch(GTFS_RT_URL);
    if (!response.ok) {
      throw new Error(`Failed to fetch GTFS-RT data: ${response.status} ${response.statusText}`);
    }


    // Ensure the response is a valid GTFS-RT binary file
    const contentType = response.headers.get('content-type');
    if (!contentType.includes('application/octet-stream') && !contentType.includes('application/x-google-protobuf')) {
      throw new Error('Invalid content type. Expected application/octet-stream or application/x-google-protobuf.');
    }

    const buffer = await response.arrayBuffer(); // Get the data as a buffer
    const feed = GtfsRealtimeBindings.transit_realtime.FeedMessage.decode(new Uint8Array(buffer)); // Decode the GTFS-RT data

    const records = [];

    // Parse trip updates
    feed.entity.forEach((entity) => {
      if (entity.tripUpdate) {
        const trip = entity.tripUpdate.trip;
        entity.tripUpdate.stopTimeUpdate.forEach((update) => {
          records.push({
            trip_id: trip.tripId,
            route_id: trip.routeId,
            stop_id: update.stopId,
            arrival_time: update.arrival?.time?.toNumber(),
            departure_time: update.departure?.time?.toNumber(),
          });
        });
      }
    });

    // Parse vehicle positions
    feed.entity.forEach((entity) => {
      if (entity.vehicle) {
        const vehicle = entity.vehicle;
        const trip = vehicle.trip || {};
        const position = vehicle.position || {};
        const vehicleDescriptor = vehicle.vehicle || {};

        records.push({
          vehicle_id: vehicleDescriptor.id || null,
          label: vehicleDescriptor.label || null,
          trip_id: trip.tripId || null,
          route_id: trip.routeId || null,
          latitude: position.latitude || null,
          longitude: position.longitude || null,
          bearing: position.bearing || null,
          speed: position.speed || null,
          timestamp: vehicle.timestamp.toNumber() || null,
        });
      }
    });

    // Save records to MongoDB
    const collection = await dbConn.collection("tripUpdates");
    await collection.deleteMany({}); // Clear old data
    await collection.insertMany(records); // Insert new data
    console.log("Trip updates saved to MongoDB.");
  } catch (error) {
    console.error("Error fetching or saving trip updates:", error);
  }
};

// Schedule the fetchAndSaveTripUpdates function to run every minute
// setInterval(fetchAndSaveTripUpdates, 60 * 1000); // 60 seconds

// Fetch trip updates immediately on server start
fetchAndSaveTripUpdates();

// API endpoint to fetch trip updates from MongoDB
router.get("/tripUpdates", async (req, res) => {
  try {
    const collection = await dbConn.collection("tripUpdates");
    const tripUpdates = await collection.find({}).toArray();
    res.status(200).json(tripUpdates);
  } catch (error) {
    console.error("Error fetching trip updates from MongoDB:", error);
    res.status(500).json({ error: "Failed to fetch trip updates" });
  }
});

router.get("/routesByStop/:stopId", async (req, res) => {
  try {
    const stopId = req.params.stopId;
    const collection = dbConn.collection("tripUpdates");

    // Await the result of the distinct query
    const routes = await collection.distinct("route_id", { stop_id: stopId });
    console.log(`Routes for stop_id ${stopId}:`, routes);
    res.status(200).json({ stop_id: stopId, routes });
    
  } catch (error) {
    console.error("Error fetching routes by stop_id:", error);
    res.status(500).json({ error: "Failed to fetch routes" });
  }
});

// const getRoutesByStopId = async (stopId) => {
//     try {
//       const collection = await dbConn.collection("tripUpdates");
  
//       // Query to find all documents with the specified stop_id
//       const routes = await collection.distinct("route_id", { stop_id: stopId });
  
//       console.log(`Routes for stop_id ${stopId}:`, routes);
//       return routes;
//     } catch (error) {
//       console.error("Error fetching routes by stop_id:", error);
//       throw error;
//     }
//   };

const fetchRoutesByStop = async (stopId) => {
    try {
      const response = await fetch(`https://localhost:5050/routesByStop/${stopId}`);
      const data = await response.json();
      return data.routes; // Assuming `routes` is the key in the response
    } catch (error) {
      console.error("Error fetching routes:", error);
      return [];
    }
  };

export default router;
