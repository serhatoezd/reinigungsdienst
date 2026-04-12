import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import db from "./database.js";
import nodemailer from "nodemailer";
import { dirname } from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

// Transporter                                // NEU
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Kontakt Route
app.post("/api/kontakt", async (req, res) => {
  const { name, telefon, email, leistung, nachricht } = req.body;

  const sql =
    "INSERT INTO kontakt (name, telefon, email, leistung, nachricht) VALUES (?, ?, ?, ?, ?)";

  try {
    await db.query(sql, [name, telefon, email, leistung, nachricht]);

    await transporter.sendMail({
      from: process.env.MAIL_USER,
      to: process.env.MAIL_TO,
      subject: `Neue Anfrage von ${name}`,
      text: `
Name: ${name}
Telefon: ${telefon}
E-Mail: ${email}
Leistung: ${leistung}
Nachricht: ${nachricht}
      `,
    });

    res.status(200).json({ message: "Nachricht erfolgreich gesendet!" });
  } catch (err) {
    console.log("Fehler:", err);
    res.status(500).json({ message: "Fehler beim Speichern" });
  }
});

// Static Files
app.use(express.static(__dirname + "/../frontend"));

// Server starten
app.listen(PORT, () => {
  console.log(`Server läuft auf Port ${PORT}`);
});
