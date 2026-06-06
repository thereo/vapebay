import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { ILike, Repository } from 'typeorm'
import { CreateProductDto } from './dto/create-product.dto'
import { QueryProductDto } from './dto/query-product.dto'
import { Product } from './entities/product.entity'

export interface ProductsListResult {
  data: Product[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly repo: Repository<Product>,
  ) {}

  async findAll(query: QueryProductDto): Promise<ProductsListResult> {
    const page = query.page ?? 1
    const limit = query.limit ?? 10
    const where = query.search
      ? { name: ILike(`%${query.search}%`) }
      : undefined

    const [data, total] = await this.repo.findAndCount({
      where,
      order: { id: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
    })

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    }
  }

  async findOne(id: number): Promise<Product> {
    const product = await this.repo.findOne({ where: { id } })
    if (!product) {
      throw new NotFoundException(`Product ${id} not found`)
    }
    return product
  }

  create(dto: CreateProductDto): Promise<Product> {
    const entity = this.repo.create({
      name: dto.name,
      description: dto.description ?? null,
      price: dto.price.toFixed(2),
    })
    return this.repo.save(entity)
  }

  async update(id: number, dto: Partial<CreateProductDto>): Promise<Product> {
    const product = await this.findOne(id)
    if (dto.name !== undefined) product.name = dto.name
    if (dto.description !== undefined) product.description = dto.description
    if (dto.price !== undefined) product.price = dto.price.toFixed(2)
    return this.repo.save(product)
  }

  async remove(id: number): Promise<void> {
    const product = await this.findOne(id)
    await this.repo.remove(product)
  }
}
