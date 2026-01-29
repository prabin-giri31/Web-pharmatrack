import { sequelize } from "./Database/db.js";

async function run() {
    try {
        await sequelize.authenticate();
        const [users] = await sequelize.query("SELECT id, email FROM users");
        console.log("USERS:", JSON.stringify(users, null, 2));
        const [customers] = await sequelize.query("SELECT id, name, \"userId\" FROM customers");
        console.log("CUSTOMERS:", JSON.stringify(customers, null, 2));
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
run();
