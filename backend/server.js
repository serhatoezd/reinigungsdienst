import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mysql from "mysql2";
import { dirname } from "path";
import { fileURLToPath } from "url";

dotenv.config();

// Datenbankverbindung
const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// Verbindung testen
db.query("SELECT 1", (err) => {
  if (err) {
    console.log("Datenbankfehler:", err);
  } else {
    console.log("Datenbank verbunden!");
  }
});

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/../frontend"));

// Kontakt Route
app.post("/api/kontakt", (req, res) => {
  const { name, telefon, email, leistung, nachricht } = req.body;

  const sql =
    "INSERT INTO kontakt (name, telefon, email, leistung, nachricht) VALUES (?, ?, ?, ?, ?)";

  db.query(sql, [name, telefon, email, leistung, nachricht], (err, result) => {
    if (err) {
      console.log("Fehler:", err);
      return res.status(500).json({ message: "Fehler beim Speichern" });
    }
    res.status(200).json({ message: "Nachricht erfolgreich gesendet!" });
  });
});

// Server starten
app.listen(PORT, () => {
  console.log(`Server läuft auf Port ${PORT}`);
});
