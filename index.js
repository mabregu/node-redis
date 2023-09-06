const express = require('express');
const redis = require('redis');

const port = 3000;
const app = express();

app.use(express.json());

const client = redis.createClient({ url: 'redis://127.0.0.1:6379' });

client.on('error', (err) => {
    console.log("Error " + err);
});

app.get('/withCache', async (req, res) => {
    try {
        const getResponse = await client.get('users');
        
        if (getResponse) {
            return res.status(200).json({
                message: 'Get data from cache',
                data: JSON.parse(getResponse)
            });
        }
        
        const response = await fetch('https://jsonplaceholder.typicode.com/users');
        const data = await response.json();
        
        client.set('users', JSON.stringify(data));
        
        return res.status(200).json({
            message: 'Get data from API',
            data
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Internal server error',
            error: error.message
        });
    }
});

app.get('/withoutCache', async (req, res) => {
    try {
        const response = await fetch('https://jsonplaceholder.typicode.com/users');
        const data = await response.json();
        
        return res.status(200).json({
            message: 'Get data from API',
            data
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Internal server error',
            error: error.message
        });
    }
});

app.listen(port, async () => {
    await client.connect();
    console.log(`Server running on http://localhost:${port}`);
});
