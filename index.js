
const express = require('express');
const app = express();
require('dotenv').config();
const userRoutes = require('./app/server/app');

const port = process.env.PORT || 3000;

app.use(express.json());


app.use('/api', userRoutes);


app.use((req, res, next) => {
    res.status(404).json({
        message: 'Route not found',
        error: 'The requested route does not exist'
    });
});


app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
