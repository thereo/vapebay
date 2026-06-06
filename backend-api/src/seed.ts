// Standalone seed script. Idempotent — uses ON CONFLICT (name) DO NOTHING after the
// TypeORM `synchronize` has added a unique index on name. Run with `npm run seed`.
// Pre-flight: ensures a unique index exists on products(name).
import 'dotenv/config'
import { Client } from 'pg'

interface Seed {
  name: string
  description: string
  price: number
}

const SEED: Seed[] = [
  {
    name: 'SMOK Nord 5 Pod System',
    description: 'Compact pod system 40W, adjustable wattage',
    price: 450000,
  },
  {
    name: 'Vaporesso XROS 4 Mini',
    description: 'Ultra-portable 1000mAh pod, 2ml capacity',
    price: 380000,
  },
  {
    name: 'Lost Mary BM600 Disposable',
    description: '600 puffs, 20mg salt nic, no charging needed',
    price: 75000,
  },
  {
    name: 'Naked 100 Lava Flow 60ml',
    description: 'Strawberry coconut pineapple freebase 3mg',
    price: 120000,
  },
  {
    name: 'Saltnic STLTH Mango Ice 30ml',
    description: 'Mango ice salt nicotine 35mg',
    price: 95000,
  },
  {
    name: 'Smok V8 Baby Coil 0.15ohm (5pcs)',
    description: 'Replacement coil for Smok TFV8 Baby',
    price: 85000,
  },
  {
    name: 'Uwell Caliburn G2 Pod',
    description: '2ml refillable pod replacement pack',
    price: 65000,
  },
  {
    name: '18650 Battery Samsung 25R',
    description: '2500mAh rechargeable battery for box mods',
    price: 90000,
  },
]

async function main() {
  const config = {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 5432),
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '1',
    database: process.env.DB_NAME || 'vapeshop_db',
  }
  const client = new Client(config)
  await client.connect()

  // Make sure schema exists (TypeORM synchronize runs when the API boots; for a
  // stand-alone seed we just create the table directly).
  await client.query(`
    CREATE TABLE IF NOT EXISTS products (
      id          SERIAL PRIMARY KEY,
      name        VARCHAR(255) NOT NULL,
      description TEXT,
      price       DECIMAL(10,2) NOT NULL CHECK (price >= 0),
      created_at  TIMESTAMP DEFAULT NOW(),
      updated_at  TIMESTAMP DEFAULT NOW()
    );
  `)
  await client.query(
    `CREATE UNIQUE INDEX IF NOT EXISTS products_name_unique ON products(name);`,
  )

  let inserted = 0
  for (const row of SEED) {
    const res = await client.query(
      `INSERT INTO products (name, description, price)
       VALUES ($1, $2, $3)
       ON CONFLICT (name) DO NOTHING
       RETURNING id`,
      [row.name, row.description, row.price.toFixed(2)],
    )
    if (res.rowCount && res.rowCount > 0) inserted += 1
  }

  // eslint-disable-next-line no-console
  console.log(`seed complete: ${inserted} inserted, ${SEED.length - inserted} already present`)
  await client.end()
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err)
  process.exit(1)
})
