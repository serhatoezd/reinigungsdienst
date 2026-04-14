import bcrypt from "bcryptjs";
import db from "./database.js";

async function createAdmin() {
  const benutzername = "admin";
  const passwort = "admin123"; // ← kannst du ändern

  const hash = await bcrypt.hash(passwort, 10);

  await db.query("INSERT INTO admin (benutzername, passwort) VALUES (?, ?)", [
    benutzername,
    hash,
  ]);

  console.log("Admin erfolgreich erstellt!");
  process.exit();
}

createAdmin();
