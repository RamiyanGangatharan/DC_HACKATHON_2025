import express from 'express';
import dbConn from './connect.js';

import {ObjectId} from 'mongodb';


const router = express.Router();

router.get("/", async (req, res) => {
    let collection = await dbConn.collection("stops");
    let results = await collection.find({}).toArray();
    res.send(results).status(200);
  });

// This section will help you get a single record by id
router.get("/:id", async (req, res) => {
  let collection = await dbConn.collection("stops");
  let query = { _id: new ObjectId(req.params.id) };
  let result = await collection.findOne(query);

  if (!result) res.send("Not found").status(404);
  else res.send(result).status(200);
});



// Find the closest stop to coordinates
router.get("/nearest/:lat/:lon", async (req, res) => {
    try {
            const userLat = parseFloat(req.params.lat);
            const userLon = parseFloat(req.params.lon);
        // Validate coordinates
        if (isNaN(userLat) || isNaN(userLon)) {
            return res.status(400).json({ error: "Invalid coordinates" });
        }
    
        let collection = await dbConn.collection("stops");
        let stops = await collection.find({}).toArray();
    if (stops.length === 0) {
        return res.status(404).json({ error: "No stops found in the database" });
    }

    // Calculate the closest stop using Haversine formula
    const toRadians = (degrees) => (degrees * Math.PI) / 180;
    const earthRadiusKm = 6371;

    let closestStop = null;
    let minDistance = Infinity;

    stops.forEach((stop) => {
        const stopLat = parseFloat(stop.stop_lat);
        const stopLon = parseFloat(stop.stop_lon);

        if (isNaN(stopLat) || isNaN(stopLon)) {
            return; // Skip stops with invalid coordinates
        }

        const dLat = toRadians(stopLat - userLat);
        const dLon = toRadians(stopLon - userLon);
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRadians(userLat)) *
        Math.cos(toRadians(stopLat)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = earthRadiusKm * c;

    if (distance < minDistance) {
        minDistance = distance;
        closestStop = {
            ...stop,
            distance: distance.toFixed(2) // Add distance in km
        };
    }
});

    res.status(200).json(closestStop);
    } catch (error) {
        console.error("Error finding nearest stop:", error);
        res.status(500).json({ error: "Failed to find nearest stop" });
    }
});

export default router;