import postgres from "postgres";

const sql = postgres({
    db: process.env.DB_NAME,
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: parseInt(process.env.DB_PORT || ""),
    hostname: process.env.DB_HOSTNAME
});

export async function saveJsonToDb(json: string) {
    const jsonRows = await sql`INSERT INTO json_rows (json) VALUES (${json})`; // Idk if the library handles parameterized queries

    console.log('json rows', jsonRows);

    return jsonRows;
}