require('dotenv').config(); 
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.DB_CONNECTION_STRING, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
    console.log('Connected to MongoDB');
});

// Create a Mongoose schema
const dataSchema = new mongoose.Schema(
    {
        timeSpent: Number,
        deviceType: String,
        country: String,
        ip: String,
        scrollDepth: Number,
    },
    { timestamps: true }
);


// Create a Mongoose model
const Data = mongoose.model('Data', dataSchema);

// Endpoint to post data
app.post('/post-data', async (req, res) => {
    try {
        const data = req.body;
        
        // Check if data with the same IP address already exists
        const existingData = await Data.findOne({ ip: data.ip });

        if (existingData) {
            // Update existing data
            existingData.timeSpent = data.timeSpent;
            existingData.deviceType = data.deviceType;
            existingData.country = data.country;
            existingData.scrollDepth = data.scrollDepth;
            await existingData.save();
            console.log('Data updated:', existingData._id);
            res.status(200).json({ message: 'Data updated successfully' });
        } else {
            // Insert new data
            const newData = new Data(data);
            await newData.save();
            console.log('Data inserted:', newData._id);
            res.status(200).json({ message: 'Data inserted successfully' });
        }
    } catch (error) {
        console.error('Error processing data:', error);
        res.status(500).json({ error: 'An error occurred' });
    }
});
// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
