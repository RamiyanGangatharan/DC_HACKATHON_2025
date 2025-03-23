# server.py
import joblib
import pandas as pd
from fastapi import FastAPI
from pydantic import BaseModel
from geographiclib.geodesic import Geodesic
import uvicorn

# uvicorn server:app --reload --host 0.0.0.0 --port 8080



app = FastAPI()

# Load model + maps
model = joblib.load("./arrival_model.pkl")
# stop_id_map = joblib.load("stop_id_map.pkl")
# route_id_map = joblib.load("route_id_map.pkl")

class VehicleInput(BaseModel):
    latitude: float
    longitude: float
    stop_lat: float
    stop_lon: float
    distance_vpos_stop: float
    timestamp_unix: int
    stop_id: int
    route_id: int

@app.post("/predict")
def predict(data: VehicleInput):
    data.distance_vpos_stop = _calculate_dist(data.latitude, data.longitude, data.stop_lat, data.stop_lon)
    print(data.__str__)

    df = pd.DataFrame([data.dict()])
    # df['stop_id'] = df['stop_id'].map(stop_id_map)
    # df['route_id'] = df['route_id'].map(route_id_map)

    features = ['latitude', 'longitude', 'stop_lat', 'stop_lon', 'distance_vpos_stop', 'timestamp_unix', 'stop_id', 'route_id']
    prediction = model.predict(df[features])[0]

    return {"predicted_delay": prediction}


def _calculate_dist(lat1, lon1, lat2, lon2) -> float:
    geod = Geodesic.WGS84
    result = geod.InverseLine(
        lat1, lon1,
        lat2, lon2
    )
    return result.s13

if __name__ == "__main__":
    uvicorn.run("server:app", host="127.0.0.1", port=4321, reload=True)