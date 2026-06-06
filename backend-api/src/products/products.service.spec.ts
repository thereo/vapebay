import { Test, TestingModule } from '@nestjs/testing'
import { getRepositoryToken } from '@nestjs/typeorm'
import { NotFoundException } from '@nestjs/common'
import { ProductsService } from './products.service'
import { Product } from './entities/product.entity'

// Minimal in-memory repo stub. The real TypeORM repo returns
// `FindOperator` objects for `where.name` (e.g. ILike), so we duck-type-check
// for a `.value` / `_value` property here rather than reaching into internals.
class RepoStub {
  rows: Product[] = []
  nextId = 1

  create(data: Partial<Product>): Product {
    return { id: this.nextId++, ...data } as Product
  }
  async save(entity: Product): Promise<Product> {
    const idx = this.rows.findIndex((r) => r.id === entity.id)
    if (idx === -1) this.rows.push(entity)
    else this.rows[idx] = entity
    return entity
  }
  async findAndCount(opts: {
    where?: Record<string, unknown>
    skip?: number
    take?: number
    order?: { id?: 'ASC' | 'DESC' }
  }): Promise<[Product[], number]> {
    let rows = this.rows.slice()
    const nameFilter = opts.where?.name as
      | { value?: string; _value?: string }
      | string
      | undefined
    if (nameFilter) {
      const raw = (nameFilter.value ?? nameFilter._value ?? nameFilter)
        .toString()
      // TypeORM's ILike wraps the value in %...%; strip them for our contains check.
      const needle = raw.replace(/^%+|%+$/g, '').toLowerCase()
      rows = rows.filter((r) => r.name.toLowerCase().includes(needle))
    }
    if (opts.order?.id === 'ASC') rows.sort((a, b) => a.id - b.id)
    const total = rows.length
    const skip = opts.skip ?? 0
    const take = opts.take ?? total
    return [rows.slice(skip, skip + take), total]
  }
  async findOne(opts: { where: { id: number } }): Promise<Product | null> {
    return this.rows.find((r) => r.id === opts.where.id) ?? null
  }
  async remove(entity: Product): Promise<Product> {
    this.rows = this.rows.filter((r) => r.id !== entity.id)
    return entity
  }
}

describe('ProductsService', () => {
  let service: ProductsService
  let repo: RepoStub

  beforeEach(async () => {
    repo = new RepoStub()
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        { provide: getRepositoryToken(Product), useValue: repo },
      ],
    }).compile()
    service = module.get(ProductsService)
  })

  it('returns paginated envelope on findAll', async () => {
    await service.create({ name: 'A Pod', price: 100000 })
    await service.create({ name: 'B Coil', price: 50000 })
    await service.create({ name: 'C Juice', price: 120000 })

    const result = await service.findAll({ page: 1, limit: 2 } as never)
    expect(result.data).toHaveLength(2)
    expect(result.meta).toEqual({
      total: 3,
      page: 1,
      limit: 2,
      totalPages: 2,
    })
  })

  it('filters by search (case-insensitive substring)', async () => {
    await service.create({ name: 'SMOK Nord 5', price: 450000 })
    await service.create({ name: 'Vaporesso XROS', price: 380000 })

    const result = await service.findAll({
      page: 1,
      limit: 10,
      search: 'smok',
    } as never)
    expect(result.data).toHaveLength(1)
    expect(result.data[0].name).toBe('SMOK Nord 5')
  })

  it('creates a product with price as 2dp string', async () => {
    const created = await service.create({
      name: 'Test Product',
      description: 'desc',
      price: 123.456,
    })
    expect(created.id).toBeDefined()
    expect(created.price).toBe('123.46')
  })

  it('throws NotFoundException on findOne for missing id', async () => {
    await expect(service.findOne(999)).rejects.toBeInstanceOf(NotFoundException)
  })
})
