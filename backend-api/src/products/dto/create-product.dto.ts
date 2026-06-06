import {
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator'

export class CreateProductDto {
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  name!: string

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  price!: number
}
