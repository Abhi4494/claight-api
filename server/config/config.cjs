// const dotenv = require('dotenv');
// dotenv.config();

// const config = {
//   development: {
//     username: process.env.DB_USERNAME,
//     password: process.env.DB_PASSWORD,
//     database: process.env.DB_DATABASE,
//     host: process.env.DB_HOST,
//     dialect: 'mysql',
//     port: process.env.DB_PORT || 3306,
//     dialectOptions: {
//       charset: 'utf8mb4',
//     },
//     logging: (dbQuery) => {
//       // console.log(dbQuery)
//     },
//     seederStorage: 'sequelize',
//     seederStoragePath: 'sequelizeData.json',
//     seederStorageTableName: 'sequelize_seeder',
//   },
//   test: {
//     username: process.env.DB_USERNAME,
//     password: process.env.DB_PASSWORD,
//     database: process.env.DB_DATABASE,
//     host: process.env.DB_HOST,
//     dialect: 'mysql',
//   },
//   production: {
//     username: process.env.DB_USERNAME,
//     password: process.env.DB_PASSWORD,
//     database: process.env.DB_DATABASE,
//     host: process.env.DB_HOST,
//     port: process.env.DB_PORT || 3306,
//     dialect: 'mysql',
//     logging: (dbQuery) => {
//       // console.log(dbQuery)
//     },
//     seederStorage: 'sequelize',
//     seederStoragePath: 'sequelizeData.json',
//     seederStorageTableName: 'sequelize_seeder',
//   },
// };

// module.exports = config;


const dotenv = require('dotenv');
dotenv.config();

const config = {
  development: {
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    host: process.env.DB_HOST,
    dialect: 'mysql',
    port: process.env.DB_PORT || 3306,
    dialectOptions: {
      charset: 'utf8mb4',
    },
    logging: (dbQuery) => {},
    seederStorage: 'sequelize',
    seederStoragePath: 'sequelizeData.json',
    seederStorageTableName: 'sequelize_seeder',
  },
  test: {
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    host: process.env.DB_HOST,
    dialect: 'mysql',
  },
  production: {
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: (dbQuery) => {},
    seederStorage: 'sequelize',
    seederStoragePath: 'sequelizeData.json',
    seederStorageTableName: 'sequelize_seeder',
  },
};

module.exports = config;
