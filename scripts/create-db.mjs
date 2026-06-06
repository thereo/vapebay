// scripts/create-db.mjs
// Idempotent CREATE DATABASE helper. Replaces the missing `createdb` CLI on this box.
// Usage: node scripts/create-db.mjs
//        DB_HOST=... DB_PORT=... DB_USER=... DB_PASSWORD=... DB_NAME=... node scripts/create-db.mjs

import { Client } from 'pg'

const config = {
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 5432),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '1',
  database: 'postgres', // connect to the maintenance DB to issue CREATE DATABASE
}

const target = process.env.DB_NAME || 'vapeshop_db'

const client = new Client(config)
try {
  await client.connect()
  const sql = `CREATE DATABASE "${target}"`
  try {
    await client.query(sql)
    console.log(`created database "${target}"`)
  } catch (err) {
    if (err.code === '42P04') {
      console.log(`database "${target}" already exists, ok`)
    } else {
      throw err
    }
  }
} finally {
  await client.end()
}
