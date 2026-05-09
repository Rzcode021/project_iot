# Smart AgriGuard

A minimalist, modern, light-themed web application for an IoT agriculture project. Built with Node.js, Express, EJS, Tailwind CSS, and Chart.js. Uses a simple local JSON file (`data.json`) for data storage.

## Features
- **Dashboard:** Live data monitoring for Temperature, Humidity, Soil Moisture, and System Status. Incorporates AI predictions fetched from an external ngrok API.
- **Intrusion Alerts:** Shows the latest 5 intrusion events.
- **Analytics:** Three separate line charts (Temperature, Humidity, Soil Moisture) showing the trend of the last 50 readings.
- **Auto-Refresh:** Both Dashboard and Analytics pages automatically refresh every 8 seconds.
- **Light Theme:** Clean, professional UI with green and teal accents.

## Installation

1. **Clone or Download the Repository**
2. **Install Dependencies:**
   ```bash
   npm install
   ```

## Local Development

Start the server:
```bash
node server.js
```
The application will be running at `http://localhost:3000`.

- **Login Credentials:**
  - Email: `demo@agriguard.com`
  - Password: `123456`

## Mocking IoT Data

To send data to the backend, you can use tools like Postman, cURL, or write a simple script:

```bash
curl -X POST http://localhost:3000/api/sensor-data \
-H "Content-Type: application/json" \
-d '{"temperature": 26.5, "humidity": 65, "soilMoisture": 42, "intrusion": false}'
```

## Integrating ngrok Predictions

In `views/dashboard.ejs`, locate the following line:
```javascript
const NGROK_API_URL = "https://your-ngrok-url.ngrok-free.app/predict";
```
Replace `https://your-ngrok-url.ngrok-free.app/predict` with your actual ngrok endpoint. The endpoint should return a JSON object like:
```json
{
  "temperature": "27.5",
  "humidity": "60.0"
}
```

## Deployment on Render.com

Render makes it very easy to deploy Node.js web services.

1. **Push to GitHub:** Commit your code and push it to a GitHub repository. Note: Add `data.json` to `.gitignore` if you don't want to preserve the dummy data, but since it's an ephemeral file system on Render (free tier), be aware that `data.json` will reset on every new deployment or instance restart.
2. **Create a Web Service on Render:**
   - Log into Render and click **New+** > **Web Service**.
   - Connect your GitHub account and select your repository.
3. **Configure the Service:**
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
4. **Deploy:** Click **Create Web Service**. Render will build and start your application. It will provide you with a `.onrender.com` URL.

*Note on Persistent Data:* Render's free tier provides an ephemeral file system. If you need data to persist across restarts, consider upgrading to a persistent disk on Render or migrating to a lightweight database (like MongoDB Atlas or SQLite with a mounted disk).
