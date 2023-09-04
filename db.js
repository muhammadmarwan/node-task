const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./databaseTB.db');

db.serialize(() => {
  db.run(`
  CREATE TABLE IF NOT EXISTS Account (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone INTEGER NOT NULL,
    password TEXT NOT NULL,
    birthday DATE, -- Use DATE data type for the birthday column
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_modified TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
  `);
});

module.exports = db;
