import mysql from "mysql2";
import dotenv from "dotenv";
// Load environment variables
dotenv.config();
// Create MySQL connection pool
const db = mysql
  .createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  })
  .promise();

// Create tables if they do not exist
const createTable = async () => {
  try {
    // Create contact table
    await db.query(`
      CREATE TABLE IF NOT EXISTS kontakt (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        telefon VARCHAR(20),
        email VARCHAR(100) NOT NULL,
        leistung VARCHAR(100),
        nachricht TEXT NOT NULL,
        erstellt_am TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    // Create admin table
    await db.query(`
      CREATE TABLE IF NOT EXISTS admin (
        id INT AUTO_INCREMENT PRIMARY KEY,
        benutzername VARCHAR(50) NOT NULL,
        passwort VARCHAR(255) NOT NULL
      )
    `);
    console.log("Tabelle bereit!");
  } catch (err) {
    console.error("DB Fehler beim Erstellen der Tabelle:", err);
  }
};
// Initialize database
createTable();

export default db;
