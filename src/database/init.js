import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import fs from 'fs';
import path from 'path';

let db;

export async function initDb() {
  // Database path from env or default
  const dbPath = process.env.DB_URL || './data/local.db';

  // Ensure directory exists (VERY IMPORTANT)
  const dir = path.dirname(dbPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  // Open SQLite database
  db = await open({
    filename: dbPath,
    driver: sqlite3.Database
  });

  // Create tables
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      role TEXT
    );

    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      parentId INTEGER
    );

    CREATE TABLE IF NOT EXISTS articles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT,
      body TEXT,
      status TEXT,
      authorRole TEXT,
      createdAt TEXT,
      reviewedAt TEXT,
      approvedAt TEXT,
      publishedAt TEXT
    );

    CREATE TABLE IF NOT EXISTS videos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT,
      url TEXT,
      status TEXT,
      createdAt TEXT
    );

    CREATE TABLE IF NOT EXISTS analytics (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      entityType TEXT,
      entityId INTEGER,
      event TEXT,
      at TEXT
    );

    CREATE TABLE IF NOT EXISTS features (
      name TEXT PRIMARY KEY,
      enabled INTEGER
    );
  `);

  // Seed SUPER_ADMIN user if DB is empty
  const row = await db.get('SELECT COUNT(*) as c FROM users');
  if (row.c === 0) {
    await db.run(
      'INSERT INTO users (username, role) VALUES (?, ?)',
      ['admin', 'SUPER_ADMIN']
    );
  }
}

export function getDb() {
  return db;
}
