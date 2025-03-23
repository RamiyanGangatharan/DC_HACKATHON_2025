import * as SQLite from 'expo-sqlite';
import { Buffer } from 'buffer';
import gtfsRealtimeBindings from 'gtfs-realtime-bindings';
import { fetchAndDecodeGTFS, parseTripUpdates } from './FetchGTFS'
// import fetch from 'node-fetch'; // If your environment doesn’t provide a global fetch

const FEED_URL = 'https://drtonline.durhamregiontransit.com/gtfsrealtime/TripUpdates';

// Open (or create) the database using the current API:

const openDatabase = async () => {
  const db = SQLite.openDatabaseAsync('gtfs.db');
  await createTripUpdatesTable(db)
  return db;
} 

const createTripUpdatesTable = async (db) => {
  await db.exec([
    {
      sql:`
        CREATE TABLE IF NOT EXISTS trip_updates (
          id TEXT PRIMARY KEY NOT NULL,
          trip_id TEXT,
          route_id TEXT,
          stop_id TEXT,
          arrival_time INTEGER,
          departure_time INTEGER
        );
      `,
    args: []
    },
  ]);
  console.log("Table: 'trip_updates' created successfully")
}

// value MUST BE flat like [trip_id, route_id, stop_id, 1700000L, 17000000L]
const insertTripUpdates = async (db, value) => {
  const result = await db.runAsync(
    'INSERT INTO trip_updates (trip_id, route_id, stop_id, arrival_time, departure_time) VALUES (?, ?, ?, ?, ?);',
    value
  );
  console.log('Item inserted successfully with ID:', result.lastInsertRowId);
}

export async function insertManyTripUpdates(db, updates) {
  for (const update of updates) {
    await db.runAsync(
      `INSERT INTO trip_updates 
        (trip_id, route_id, stop_id, arrival_time, departure_time) 
       VALUES (?, ?, ?, ?, ?);`,
      [
        update.trip_id,
        update.route_id,
        update.stop_id,
        update.arrival_time,
        update.departure_time
      ]
    );
  }
}

const getTripUpdates = async (db) => {
  const result = await db.queryAsync(`SELECT * FROM trip_updates;`);
  return result.rows;
}

// Fetch a .pb file, decode it, and store trip updates into SQLite:
export const fetchAndStoreTripUpdates = async (db) => {
  try {
    // Create table if it doesn't exist.
    createTripUpdatesTable();

    const response = await fetch(FEED_URL);
    const arrayBuffer = await response.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    // Decode the protobuf using gtfs-realtime-bindings.
    const FeedMessage = gtfsRealtimeBindings.transit_realtime.FeedMessage.decode(uint8Array);
    console.log('Decoded feed message:', FeedMessage);

    // Loop through each entity and, if it contains a trip update, store each stop time update.
    if (FeedMessage.entity) {
      FeedMessage.entity.forEach(entity => {
        if (entity.trip_update && entity.trip_update.trip) {
          const trip = entity.trip_update.trip;
          entity.trip_update.stop_time_update.forEach(update => {
            const tripUpdate = [
              `${entity.id}_${update.stop_id}`,
              trip.tripId,trip.routeId,
              update.stop_id,
              update.arrival ? update.arrival.time : null,
              update.departure ? update.departure.time : null,
            ];
            insertTripUpdate(db, tripUpdate);
          });
        }
      });
    }
  } catch (error) {
    console.error('Error fetching and storing trip updates:', error);
  }
};

export const fetchProtobufData = () => {
  const db = openDatabase();
  fetchAndStoreTripUpdates(db);
}

export const readTripUpdates = () => {
  const db = openDatabase();
  return getTripUpdates(db);
};

export const updateTripUpdates = async () => {
  try {
    const db = await openDatabase();
    const feed = await fetchAndDecodeGTFS(FEED_URL);
    const updates = parseTripUpdates(feed);

    console.log('🚏 Decoded updates:', updates.length);

    await insertManyTripUpdates(db, updates);

    console.log('✅ Trip updates inserted into SQLite');
  } catch (err) {
    console.error('❌ Failed to update GTFS trip updates:', err);
    console.error(updates[0].tripId)
  }
}
