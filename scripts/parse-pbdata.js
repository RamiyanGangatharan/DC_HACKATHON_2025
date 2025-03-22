const GtfsRealtimeBindings = require ("gtfs-realtime-bindings")
const { transit_realtime } = require("gtfs-realtime-bindings");
const fs = require("fs")
const { parse } = require("json2csv")

const buffer = fs.readFileSync("vehicle_positions.pb")
const feed = transit_realtime.FeedMessage.decode(buffer)

const records = [];

const toIso = (timestamp) =>
  timestamp?.toNumber ? new Date(timestamp.toNumber() * 1000).toISOString() : null;

feed.entity.forEach(entity => {
  if (entity.tripUpdate) {
    const trip = entity.tripUpdate.trip;
    entity.tripUpdate.stopTimeUpdate.forEach(update => {
      records.push({
        trip_id: trip.tripId,
        route_id: trip.routeId,
        stop_id: update.stopId,
        arrival_time: toIso(update.arrival?.time),
        departure_time: toIso(update.departure?.time)      
      });
    });
  }
});

feed.entity.forEach(entity => {
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
      timestamp: toIso(vehicle.timestamp || null)
    });
  }
});


// Convert to CSV
const csv = parse(records);

// Write to file
fs.writeFileSync("vehicle_positions.csv", csv);

console.log("✅ CSV saved to output.csv");
