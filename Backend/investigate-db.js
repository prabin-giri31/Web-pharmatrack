import { sequelize } from "./Database/db.js";

async function investigate() {
    try {
        await sequelize.authenticate();
        console.log("Database connected.");

        const [results] = await sequelize.query("SELECT * FROM customers ORDER BY \"createdAt\" DESC LIMIT 5");
        console.log("LATEST_CUSTOMERS_START");
        results.forEach(c => console.log(`ID: ${c.id}, Name: ${c.name}, UserId: ${c.userId}, CreatedAt: ${c.createdAt}`));
        console.log("LATEST_CUSTOMERS_END");

        process.exit(0);
    } catch (error) {
        console.error("Investigation failed:", error);
        process.exit(1);
    }
}

investigate();
