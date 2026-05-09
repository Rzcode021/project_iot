const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(express.static('public'));

const dataFile = path.join(__dirname, 'data.json');

// Helper to read data
const readData = () => {
    try {
        if (!fs.existsSync(dataFile)) {
            fs.writeFileSync(dataFile, JSON.stringify([]));
        }
        const data = fs.readFileSync(dataFile, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading data file', error);
        return [];
    }
};

// Helper to write data
const writeData = (data) => {
    try {
        fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Error writing data file', error);
    }
};

// --- Web Routes ---

// Login page
app.get('/', (req, res) => {
    res.render('login', { error: null });
});

// Handle Login (Mock Authentication)
app.post('/login', (req, res) => {
    const { email, password } = req.body;
    if (email === 'demo@agriguard.com' && password === '123456') {
        res.redirect('/dashboard');
    } else {
        res.render('login', { error: 'Invalid credentials. Use demo@agriguard.com / 123456' });
    }
});

// Dashboard page
app.get('/dashboard', (req, res) => {
    res.render('dashboard');
});

// Analytics page
app.get('/analytics', (req, res) => {
    res.render('analytics');
});

// --- API Routes ---

// Receive sensor data from ESP8266
app.post('/api/sensor-data', (req, res) => {
    const { temperature, humidity, soilMoisture, intrusion } = req.body;
    
    // Status calculation
    let status = 'Safe';
    if (intrusion) {
        status = 'Intrusion Detected';
    } else if (soilMoisture < 30) {
        status = 'Irrigation Needed';
    }

    const newRecord = {
        timestamp: new Date().toISOString(),
        temperature: parseFloat(temperature) || 0,
        humidity: parseFloat(humidity) || 0,
        soilMoisture: parseFloat(soilMoisture) || 0,
        intrusion: Boolean(intrusion),
        status: status
    };

    const data = readData();
    data.unshift(newRecord); // Add to beginning
    
    // Keep max 100 records
    if (data.length > 100) {
        data.pop();
    }
    
    writeData(data);
    res.status(200).json({ message: 'Data received', record: newRecord });
});

// Get latest data
app.get('/api/latest', (req, res) => {
    const data = readData();
    const latest = data[0] || null;
    const intrusions = data.filter(d => d.intrusion).slice(0, 5);
    
    res.json({
        latest,
        intrusions,
        history: data.slice(0, 50) // For analytics (last 50 readings)
    });
});

// --- Backward Compatibility Routes for your ESP8266 code ---

// 1. Receive data via GET request
app.get('/save-sensor', (req, res) => {
    const { temp, hum } = req.query;
    
    const newRecord = {
        timestamp: new Date().toISOString(),
        temperature: parseFloat(temp) || 0,
        humidity: parseFloat(hum) || 0,
        soilMoisture: 0, // Your code doesn't send this yet
        intrusion: false, // Your code doesn't send this yet
        status: 'Safe'
    };

    const data = readData();
    data.unshift(newRecord);
    if (data.length > 100) data.pop();
    writeData(data);
    
    res.send("Data Saved");
});

// 2. LCD Text API
app.get('/get-lcd-text', (req, res) => {
    const data = readData();
    const latest = data[0];
    if (latest) {
        res.send(`Temp:${latest.temperature}C Hum:${latest.humidity}%`);
    } else {
        res.send("System Active");
    }
});

// 3. Prediction API (Returns the format your JSON parser expects)
app.get('/prediction', (req, res) => {
    // You can later connect this to your ngrok API. 
    // For now, it returns the exact JSON structure your ESP is looking for:
    res.json({
        predicted_temperature: [28.0],
        predicted_humidity: [61.5]
    });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
