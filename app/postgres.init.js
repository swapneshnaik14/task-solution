const { Sequelize } = require('sequelize');

const sequelize = new Sequelize({
    dialect: 'postgres',
    host: process.env.DB_HOST || 'localhost',        
    username: process.env.DB_USERNAME || 'postgres', 
    password: process.env.DB_PASSWORD || '',         
    database: process.env.DB_NAME || 'user',    
    logging: false,
});

module.exports = sequelize;