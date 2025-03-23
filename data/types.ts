
export type TripUpdate = {
    id: string;
    trip_id: string;
    route_id: string;
    stop_id: string;
    arrival_low: number;
    arrival_high: number;
    arrival_unsigned: number;
    departure_low: number;
    departure_high: number;
    departure_unsigned: number;
  };
  