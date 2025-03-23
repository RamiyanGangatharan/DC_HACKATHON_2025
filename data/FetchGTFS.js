import { transit_realtime } from 'gtfs-realtime-bindings';

export async function fetchAndDecodeGTFS(url) {
  const response = await fetch(url);
  const arrayBuffer = await response.arrayBuffer();
  const uint8Array = new Uint8Array(arrayBuffer);
  const feed = transit_realtime.FeedMessage.decode(uint8Array);
  return feed;
}

export function parseTripUpdates(feed) {
  const updates = [];

  for (const entity of feed.entity) {
    if (!entity.tripUpdate || !entity.tripUpdate.trip) continue;

    const trip = entity.tripUpdate.trip;

    for (const stop of entity.tripUpdate.stopTimeUpdate) {
      updates.push({
        trip_id: trip.tripId || '',
        route_id: trip.routeId || '',
        stop_id: stop.stopId || '',
        arrival_time: stop.arrival?.time?.toNumber?.() || null,
        departure_time: stop.departure?.time?.toNumber?.() || null
      });
    }
  }

  return updates;
}
