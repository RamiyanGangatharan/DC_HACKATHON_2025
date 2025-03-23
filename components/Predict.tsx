import { useEffect, useState } from "react"
import { View, Text, Button } from 'react-native'


// 2 coordinates to find GeodesicInverse distance between two points
interface PredictProps {
    latitude: number;
    longitude: number;
    stop_lat: number;
    stop_lon: number;
    stop_id: number;
    route_id: number;
}
  
const Predict: React.FC<PredictProps> = ({
    latitude,
    longitude,
    stop_lat,
    stop_lon,
    stop_id,
    route_id
  }) => {
    
    const [predictedDelay, setPredictedDelay] = useState<number | null>(null)

    // useEffect(() => {
        const timestamp_unix = Math.floor(Date.now() / 1000);

        const fetchPredictedDelay = async () => {
            const res = await fetch("https://eb13-192-197-54-31.ngrok-free.app/predict", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  latitude: latitude,
                  longitude: longitude,
                  stop_lat: stop_lat,
                  stop_lon: stop_lon,
                  distance_vpos_stop: 0,
                  timestamp_unix: timestamp_unix,
                  stop_id: stop_id,
                  route_id: route_id
                })
              });
              
              const json = await res.json();
              console.log("Predicted delay:", json.predicted_delay); 
              setPredictedDelay(json.predicted_delay);             
        }
        // fetchPredictedDelay();
    // }, []);
    

    // use these values in your component
    return (
      <View>
        <Text>Predicting arrival for stop {stop_id}...</Text>
        <Button title="fetch" onPress={() => fetchPredictedDelay()} ></Button>
        <Text>{predictedDelay !== null ? `Estimated delay: ${predictedDelay} seconds` : "Loading..."}</Text>
        <Text>latitude: {latitude}</Text>
        <Text>longitude: {longitude}</Text>
        <Text>stop_lat: {stop_lat}</Text>
        <Text>stop_lon: {stop_lon}</Text>
      </View>
    );
  };
  export default Predict;
    
