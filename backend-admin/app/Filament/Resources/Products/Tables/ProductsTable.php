<?php

namespace App\Filament\Resources\Products\Tables;

use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\Filter;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Filament\Forms\Components\TextInput;

class ProductsTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('name')
                    ->searchable()
                    ->sortable(),
                TextColumn::make('price')
                    ->money('IDR', locale: 'id_ID')
                    ->sortable(),
                TextColumn::make('description')
                    ->searchable()
                    ->wrap()
                    ->limit(60),
                TextColumn::make('created_at')
                    ->dateTime()
                    ->sortable(),
            ])
            ->defaultSort('created_at', 'desc')
            ->filters([
                Filter::make('price_range')
                    ->schema([
                        TextInput::make('price_from')
                            ->label('Min price (IDR)')
                            ->numeric()
                            ->prefix('Rp'),
                        TextInput::make('price_to')
                            ->label('Max price (IDR)')
                            ->numeric()
                            ->prefix('Rp'),
                    ])
                    ->query(function (Builder $query, array $data): Builder {
                        return $query
                            ->when(
                                $data['price_from'] ?? null,
                                fn (Builder $q, $value) => $q->where('price', '>=', $value),
                            )
                            ->when(
                                $data['price_to'] ?? null,
                                fn (Builder $q, $value) => $q->where('price', '<=', $value),
                            );
                    }),
            ])
            ->recordActions([
                EditAction::make(),
            ])
            ->toolbarActions([
                BulkActionGroup::make([
                    DeleteBulkAction::make(),
                ]),
            ]);
    }
}
