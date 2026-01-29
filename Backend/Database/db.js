import { Sequelize } from "sequelize";
import dotenv from "dotenv";
dotenv.config();

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: "postgres",
    logging: false, // Disable verbose logs in production
    dialectOptions: process.env.DB_SSL === "true" ? { ssl: { require: true, rejectUnauthorized: false } } : {},
    // Connection pool settings to prevent connection exhaustion
    pool: {
      max: 10,        // Maximum number of connections in pool
      min: 0,         // Minimum number of connections in pool
      acquire: 30000, // Maximum time (ms) to get a connection before throwing error
      idle: 10000,    // Maximum time (ms) a connection can be idle before being released
    },
    // Retry logic for transient failures
    retry: {
      max: 3,
      match: [
        /SequelizeConnectionError/,
        /SequelizeConnectionRefusedError/,
        /SequelizeHostNotFoundError/,
        /SequelizeHostNotReachableError/,
        /SequelizeInvalidConnectionError/,
        /SequelizeConnectionTimedOutError/,
        /TimeoutError/,
        /ECONNRESET/,
        /ECONNREFUSED/,
      ],
    },
  }
);

const testConnection = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connection established successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
};

export { sequelize, testConnection };
