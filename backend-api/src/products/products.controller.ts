import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common'
import { CreateProductDto } from './dto/create-product.dto'
import { QueryProductDto } from './dto/query-product.dto'
import { ProductsService } from './products.service'

@Controller('products')
export class ProductsController {
  constructor(private readonly products: ProductsService) {}

  @Get()
  list(@Query() query: QueryProductDto) {
    return this.products.findAll(query)
  }

  @Get(':id')
  show(@Param('id', ParseIntPipe) id: number) {
    return this.products.findOne(id)
  }

  @Post()
  create(@Body() dto: CreateProductDto) {
    return this.products.create(dto)
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: Partial<CreateProductDto>,
  ) {
    return this.products.update(id, dto)
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.products.remove(id)
    return { deleted: true }
  }
}
