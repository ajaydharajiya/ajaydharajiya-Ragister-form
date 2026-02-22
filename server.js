const express = require("express");
const { Pool } = require("pg");

const app = express();

// Built-in middleware (no need for body-parser)
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));

// PostgreSQL connection
const pool = new Pool({
    user: "postgres",
    host: "localhost",
    database: "registerdb",
    password: "1234", // 🔴 CHANGE THIS to your real postgres password
    port: 5432,
});

// Test DB connection
pool.connect()
    .then(() => console.log("Connected to PostgreSQL ✅"))
    .catch(err => console.error("Database connection error:", err.message));

// Create table safely
const createTable = async () => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                fullname VARCHAR(100),
                email VARCHAR(100) UNIQUE,
                password VARCHAR(100),
                phone VARCHAR(15)
            )
        `);
        console.log("Users table ready ✅");
    } catch (err) {
        console.error("Table creation error:", err.message);
    }
};

createTable();

// Handle form submission
app.post("/register", async (req, res) => {
    const { fullname, email, password, phone } = req.body;

    try {
        await pool.query(
            "INSERT INTO users (fullname, email, password, phone) VALUES ($1,$2,$3,$4)",
            [fullname, email, password, phone]
        );

        res.send("Registration Successful ✅");
    } catch (err) {
        if (err.code === "23505") {
            res.send("Email already exists ❌");
        } else {
            res.send("Error: " + err.message);
        }
    }
});

app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});