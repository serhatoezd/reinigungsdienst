import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import db from "./database.js";
import nodemailer from "nodemailer";
import session from "express-session";
import bcrypt from "bcryptjs";
import { dirname } from "path";
import { fileURLToPath } from "url";

// Load environment variables
dotenv.config();

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

// Configure email transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

// Configure middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: process.env.SESSION_SECRET || "geheimespasswort123",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false },
  }),
);

// Contact Route
app.post("/api/kontakt", async (req, res) => {
  const { name, telefon, email, leistung, nachricht } = req.body;

  const sql =
    "INSERT INTO kontakt (name, telefon, email, leistung, nachricht) VALUES (?, ?, ?, ?, ?)";

  try {
    // Save contact request to database
    await db.query(sql, [name, telefon, email, leistung, nachricht]);
  } catch (err) {
    console.error("DB Fehler:", err);
    return res.status(500).json({ message: "Fehler beim Speichern" });
  }

  try {
    // Send email notification to owner
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
  } catch (err) {
    console.error("Mail Fehler:", err);
  }

  res.status(200).json({ message: "Nachricht erfolgreich gesendet!" });
});

// Admin Middleware
// Check if admin is authenticated
const istEingeloggt = (req, res, next) => {
  if (req.session.admin) {
    next();
  } else {
    res.status(401).json({ message: "Nicht eingeloggt" });
  }
};

// Admin Login
app.post("/api/admin/login", async (req, res) => {
  const { benutzername, passwort } = req.body;

  try {
    // Check if admin exists in database
    const [rows] = await db.query(
      "SELECT * FROM admin WHERE benutzername = ?",
      [benutzername],
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: "Falsche Zugangsdaten" });
    }

    const admin = rows[0];
    // Verify password with bcrypt
    const passwortKorrekt = await bcrypt.compare(passwort, admin.passwort);

    if (!passwortKorrekt) {
      return res.status(401).json({ message: "Falsche Zugangsdaten" });
    }
    // Set session
    req.session.admin = true;
    res.status(200).json({ message: "Login erfolgreich" });
  } catch (err) {
    console.error("Login Fehler:", err);
    res.status(500).json({ message: "Serverfehler" });
  }
});

// Admin Logout
app.post("/api/admin/logout", (req, res) => {
  // Destroy session and redirect to login
  req.session.destroy();
  res.status(200).json({ message: "Logout erfolgreich" });
});

// Get All Requests
app.get("/api/admin/anfragen", istEingeloggt, async (req, res) => {
  try {
    // Fetch all contact requests ordered by date
    const [rows] = await db.query(
      "SELECT * FROM kontakt ORDER BY erstellt_am DESC",
    );
    res.status(200).json(rows);
  } catch (err) {
    console.error("DB Fehler:", err);
    res.status(500).json({ message: "Fehler beim Abrufen" });
  }
});

// Delete Request
app.delete("/api/admin/anfragen/:id", istEingeloggt, async (req, res) => {
  const { id } = req.params;
  try {
    // Delete contact request by ID
    await db.query("DELETE FROM kontakt WHERE id = ?", [id]);
    res.status(200).json({ message: "Anfrage gelöscht" });
  } catch (err) {
    console.error("DB Fehler:", err);
    res.status(500).json({ message: "Fehler beim Löschen" });
  }
});

// Static Files
app.use(express.static(__dirname + "/../frontend"));

// Start server
app.listen(PORT, () => {
  console.log(`Server läuft auf Port ${PORT}`);
});
