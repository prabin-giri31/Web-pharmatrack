import { sequelize } from "./Database/db.js";

async function run() {
    try {
        await sequelize.authenticate();
        const [results] = await sequelize.query("SELECT table_schema, table_name FROM information_schema.tables WHERE table_schema NOT IN ('information_schema', 'pg_catalog')");
        console.log("TABLES_RAW:", JSON.stringify(results, null, 2));
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
run();
