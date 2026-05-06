const { Pool } = require("pg");
const config = require("./config");

const pool = new Pool({
  connectionString: config.dbUrl,
  ssl: config.ssl ? { rejectUnauthorized: false } : false
});

module.exports = pool;