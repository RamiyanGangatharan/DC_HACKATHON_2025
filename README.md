# The Inaugural Durham College Hackathon 2025

**Repository for DC Hackathon 2025**  
Taking place on **March 22<sup>nd</sup>, 2025** at Durham College.  
Project by **Ramiyan Gangatharan, Maxwell Dinsmore, and Josiah Barbe**.  

---

## 📖 Project Story

We initially debated between creating:  
- A **front-end bus tracking application**, or  
- An **admin-facing application for analysis**.  

As a middle ground, we chose to develop with **React Native**, implementing **OpenData API** first before finalizing our product’s design.  

---
## ✅ Prerequisites

- Node.js (v18 or later recommended)
- `npm` or `yarn`
- Python3 v.3.10+
- A smartphone (Android or iOS)
- Connected to the **same Wi-Fi network** as your development co
---
### 📱 Running the React Native App with Expo Go

This guide walks you through how to run this project using **Expo Go** on your **real mobile device** (iOS or Android).

#### 🧱 1. Clone the Project

```bash
git clone https://github.com/RamiyanGangatharan/DC_HACKATHON_2025.git
cd DC_HACKATHON_2025
```

#### 📦 2. Install Expo CLI (if not already)

```bash
npm install -g expo-cli
```

#### 🚀 3. Start Expo Server

```bash
npm install     # or yarn install
npx expo start --tunnel # or just: expo start
```
#### 📲 3. Install Expo Go on Your Phone
Phone
📱 iOS:
Download from the App Store: [Expo Go](https://apps.apple.com/us/app/expo-go/id982107779) for iOS

🤖 Android:
Download from Google Play: [Expo Go](https://play.google.com/store/apps/details?id=host.exp.exponent&hl=en) for Android

#### 🔗 4. Run the App on Your Phone
Open Expo Go on your phone.

Scan the QR code from the terminal or the web dashboard.

The app will load on your device!

-> Make sure your phone and your computer are on the same Wi-Fi network.

---
### 🧠 Machine Learning Backend – Arrival Time Prediction API
#### 🚀 Features

- Trains a `RandomForestRegressor` to predict `arrival_delay` in seconds
- Uses GTFS-derived vehicle + stop data
- Exposes a `/predict` HTTP endpoint via FastAPI using `ngrok` npm library 
- Supports integration with a React Native frontend (Expo or bare React Native)

---

### 📦 Requirements

- Python 3.8+
- pip (Python package manager)
- venv (recommended)

---

### 🛠 Setup

#### 1. Clone the repository

```bash
git clone https://github.com/RamiyanGangatharan/DC_HACKATHON_2025.git
cd DC_HACKATHON_2025/scripts/
```

#### 2. Create and activate a virtual environment
```bash
python -m venv venv
source venv/bin/activate        # on Mac/Linux
venv\Scripts\activate           # on Windows
```

#### 3. Install Libraries
```bash
pip install -r requirements.txt
```

#### 4. Run Server Backend 
```bash
uvicorn server:app --host 127.0.0.1 --port 4321 --reload
```
🔁 Sample Request (cURL)
```bash
curl -X POST http://localhost:4321/predict \
  -H "Content-Type: application/json" \
  -d '{
    "latitude": 40.741,
    "longitude": -73.989,
    "stop_lat": 40.742,
    "stop_lon": -73.990,
    "distance_vpos_stop": 74.3,
    "timestamp_unix": 1745548800,
    "stop_id": "3537",
    "route_id": "419"
}'
```
output gives delay based on provided features
```bash
{
  "predicted_delay": 241.87
}
```
---
This is the backend service for predicting bus arrival delays based on real-time vehicle positions using a trained machine learning model.

## 🛠 Dev Logs
- **🕐 11:00 AM** – Initial Concepts, Wireframing, group meeting
- **🕛 12:00 PM** – Planning started, and initial prototypes were created.  
- **🕐 1:00 PM** – Basic template for the application was set up.
- **🕐 2:00 PM** –
- **🕐 3:00 PM** –
- **🕐 4:00 PM** –
- **🕠 5:00 PM** – Merged all branches into Josiah’s branch. Final merge into `main` pending fixes.
- **🕐 6:00 PM** –
- **🕐 7:00 PM** –
- **🕐 8:00 PM** –
