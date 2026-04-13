import mysql from "mysql2";
import dotenv from "dotenv";

dotenv.config();

const db = mysql
  .createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  })
  .promise();

// Tabelle erstellen falls nicht vorhanden
const createTable = async () => {
  try {
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
    console.log("Tabelle bereit!");
  } catch (err) {
    console.error("DB Fehler beim Erstellen der Tabelle:", err);
  }
};

createTable();

export default db;
