import bcrypt from "bcryptjs";
import db from "./database.js";

// Create admin user with hashed password
async function createAdmin() {
  const benutzername = "admin";
  const passwort = "admin123";

  // Hash the password
  const hash = await bcrypt.hash(passwort, 10);
  // Insert admin into database
  await db.query("INSERT INTO admin (benutzername, passwort) VALUES (?, ?)", [
    benutzername,
    hash,
  ]);

  console.log("Admin erfolgreich erstellt!");
  process.exit();
}
// Run function
createAdmin();
