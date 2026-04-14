import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import db from "./database.js";
import nodemailer from "nodemailer";
import session from "express-session";
import bcrypt from "bcryptjs";
import { dirname } from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

// Transporter
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
app.use(
  session({
    secret: process.env.SESSION_SECRET || "geheimespasswort123",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false },
  }),
);

// ── Kontakt Route ──────────────────────────────────────────
app.post("/api/kontakt", async (req, res) => {
  const { name, telefon, email, leistung, nachricht } = req.body;

  const sql =
    "INSERT INTO kontakt (name, telefon, email, leistung, nachricht) VALUES (?, ?, ?, ?, ?)";

  try {
    await db.query(sql, [name, telefon, email, leistung, nachricht]);
  } catch (err) {
    console.error("DB Fehler:", err);
    return res.status(500).json({ message: "Fehler beim Speichern" });
  }

  try {
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

// ── Admin Middleware ───────────────────────────────────────
const istEingeloggt = (req, res, next) => {
  if (req.session.admin) {
    next();
  } else {
    res.status(401).json({ message: "Nicht eingeloggt" });
  }
};

// ── Admin Login ────────────────────────────────────────────
app.post("/api/admin/login", async (req, res) => {
  const { benutzername, passwort } = req.body;

  try {
    const [rows] = await db.query(
      "SELECT * FROM admin WHERE benutzername = ?",
      [benutzername],
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: "Falsche Zugangsdaten" });
    }

    const admin = rows[0];
    const passwortKorrekt = await bcrypt.compare(passwort, admin.passwort);

    if (!passwortKorrekt) {
      return res.status(401).json({ message: "Falsche Zugangsdaten" });
    }

    req.session.admin = true;
    res.status(200).json({ message: "Login erfolgreich" });
  } catch (err) {
    console.error("Login Fehler:", err);
    res.status(500).json({ message: "Serverfehler" });
  }
});

// ── Admin Logout ───────────────────────────────────────────
app.post("/api/admin/logout", (req, res) => {
  req.session.destroy();
  res.status(200).json({ message: "Logout erfolgreich" });
});

// ── Alle Anfragen abrufen ──────────────────────────────────
app.get("/api/admin/anfragen", istEingeloggt, async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM kontakt ORDER BY erstellt_am DESC",
    );
    res.status(200).json(rows);
  } catch (err) {
    console.error("DB Fehler:", err);
    res.status(500).json({ message: "Fehler beim Abrufen" });
  }
});

// ── Anfrage löschen ────────────────────────────────────────
app.delete("/api/admin/anfragen/:id", istEingeloggt, async (req, res) => {
  const { id } = req.params;
  try {
    await db.query("DELETE FROM kontakt WHERE id = ?", [id]);
    res.status(200).json({ message: "Anfrage gelöscht" });
  } catch (err) {
    console.error("DB Fehler:", err);
    res.status(500).json({ message: "Fehler beim Löschen" });
  }
});

// ── Static Files ───────────────────────────────────────────
app.use(express.static(__dirname + "/../frontend"));

// Server starten
app.listen(PORT, () => {
  console.log(`Server läuft auf Port ${PORT}`);
});
