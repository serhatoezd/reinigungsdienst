-- Datenbank erstellen
CREATE DATABASE IF NOT EXISTS reinigungsdienst;

USE reinigungsdienst;

-- Tabelle: kontakt
CREATE TABLE IF NOT EXISTS kontakt (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    telefon VARCHAR(20),
    email VARCHAR(100) NOT NULL,
    leistung VARCHAR(100),
    nachricht TEXT NOT NULL,
    erstellt_am TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabelle: admin
CREATE TABLE IF NOT EXISTS admin (
    id INT AUTO_INCREMENT PRIMARY KEY,
    benutzername VARCHAR(50) NOT NULL,
    passwort VARCHAR(255) NOT NULL
);