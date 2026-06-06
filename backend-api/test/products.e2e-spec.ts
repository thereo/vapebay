// E2E test — boots the full Nest app against a separate `vapeshop_e2e` database
// so it never touches dev data. The bootstrap below creates that DB if missing.

import { INestApplication, ValidationPipe } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { Client } from 'pg'
import request from 'supertest'
import { AppModule } from '../src/app.module'

const E2E_DB = 'vapeshop_e2e'
const baseConfig = {
  DB_HOST: 'localhost',
  DB_PORT: '5432',
  DB_USER: 'postgres',
  DB_PASSWORD: '1',
  DB_NAME: E2E_DB,
}

async function ensureDb() {
  const client = new Client({
    host: baseConfig.DB_HOST,
    port: Number(baseConfig.DB_PORT),
    user: baseConfig.DB_USER,
    password: baseConfig.DB_PASSWORD,
    database: 'postgres',
  })
  await client.connect()
  try {
    await client.query(`CREATE DATABASE "${E2E_DB}"`)
  } catch (err) {
    if ((err as { code?: string }).code !== '42P04') throw err
  }
  await client.end()
}

async function truncate() {
  const client = new Client({
    host: baseConfig.DB_HOST,
    port: Number(baseConfig.DB_PORT),
    user: baseConfig.DB_USER,
    password: baseConfig.DB_PASSWORD,
    database: E2E_DB,
  })
  await client.connect()
  await client.query('TRUNCATE TABLE products RESTART IDENTITY')
  await client.end()
}

describe('Products API (e2e)', () => {
  let app: INestApplication

  beforeAll(async () => {
    await ensureDb()
    Object.assign(process.env, baseConfig)

    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleRef.createNestApplication()
    app.setGlobalPrefix('api')
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
    )
    await app.init()
  })

  beforeEach(async () => {
    await truncate()
  })

  afterAll(async () => {
    await app.close()
  })

  it('GET /api/products returns the envelope', async () => {
    const res = await request(app.getHttpServer()).get('/api/products').expect(200)
    expect(res.body).toHaveProperty('data')
    expect(res.body).toHaveProperty('meta')
    expect(res.body.meta).toEqual(
      expect.objectContaining({ total: 0, page: 1, limit: 10, totalPages: 1 }),
    )
  })

  it('POST /api/products with valid data returns 201', async () => {
    const payload = {
      name: 'SMOK Nord 5 Pod System',
      description: 'Compact pod system 40W',
      price: 450000,
    }
    const res = await request(app.getHttpServer())
      .post('/api/products')
      .send(payload)
      .expect(201)
    expect(res.body).toMatchObject({
      name: payload.name,
      description: payload.description,
      price: '450000.00',
    })
  })

  it('POST /api/products with empty name returns 400', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/products')
      .send({ name: '', price: 100000 })
      .expect(400)
    expect(res.body.message).toEqual(expect.arrayContaining([expect.any(String)]))
  })

  it('POST /api/products with negative price returns 400', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/products')
      .send({ name: 'X', price: -1 })
      .expect(400)
    expect(res.body.message).toEqual(expect.arrayContaining([expect.any(String)]))
  })

  it('search query filters by name (case-insensitive)', async () => {
    await request(app.getHttpServer())
      .post('/api/products')
      .send({ name: 'SMOK Nord 5', price: 450000 })
      .expect(201)
    await request(app.getHttpServer())
      .post('/api/products')
      .send({ name: 'Vaporesso XROS', price: 380000 })
      .expect(201)

    const res = await request(app.getHttpServer())
      .get('/api/products?search=smok')
      .expect(200)
    expect(res.body.data).toHaveLength(1)
    expect(res.body.data[0].name).toBe('SMOK Nord 5')
  })
})
