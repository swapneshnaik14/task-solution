const { DataTypes } = require('sequelize');
const sequelize = require('../postgres.init');

const UserProcessingStatus = sequelize.define('UserProcessingStatus', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      slug: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      status: {
        type: DataTypes.STRING(50),
        allowNull: false
      }
    }, {
      tableName: 'user_status',
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at'
 });

async function sync() {
  await sequelize.sync();
  console.log('User Status table has been synchronized.');
}

sync();


module.exports = UserProcessingStatus;
