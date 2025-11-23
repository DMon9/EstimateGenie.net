import Database from 'better-sqlite3';
import path from 'path';

const db = new Database(path.join(process.cwd(), 'users.db'));

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    tier TEXT DEFAULT 'free',
    joined_date TEXT NOT NULL,
    pdf_downloads INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

export default db;
