const { DataTypes } = require('sequelize');
const sequelize = require('../postgres.init');

const User = sequelize.define('User', {
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    age: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    address: {
        type: DataTypes.JSONB,
        allowNull: true,
    },
    additional_info: {
        type: DataTypes.JSONB,
        allowNull: true,
    },
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
}, {
    tableName: 'users',
    timestamps: false, 
    indexes: [
        {
            fields: ['age', 'name']
        },
    ],
});


async function sync() {
    await sequelize.sync();
    console.log('User table has been synchronized.');
  }
  
sync();

module.exports = User;
