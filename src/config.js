// src/config.js
const { db } = require('./db');

function getConfig(key) {
  const stmt = db.prepare('SELECT value FROM config WHERE key = ?');
  const row = stmt.get(key);
  return row ? row.value : null;
}

function setConfig(key, value) {
  const stmt = db.prepare('INSERT OR REPLACE INTO config (key, value) VALUES (?, ?)');
  stmt.run(key, value);
}

function getAllConfig() {
  const stmt = db.prepare('SELECT key, value FROM config');
  return stmt.all();
}

module.exports = {
  getConfig,
  setConfig,
  getAllConfig
};
