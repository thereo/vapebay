<?php

namespace Database\Seeders;

use App\Models\Product;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        $products = [
            ['SMOK Nord 5 Pod System',          'Compact pod system 40W, adjustable wattage',    450000],
            ['Vaporesso XROS 4 Mini',           'Ultra-portable 1000mAh pod, 2ml capacity',      380000],
            ['Lost Mary BM600 Disposable',      '600 puffs, 20mg salt nic, no charging needed',  75000],
            ['Naked 100 Lava Flow 60ml',        'Strawberry coconut pineapple freebase 3mg',     120000],
            ['Saltnic STLTH Mango Ice 30ml',    'Mango ice salt nicotine 35mg',                  95000],
            ['Smok V8 Baby Coil 0.15ohm (5pcs)','Replacement coil for Smok TFV8 Baby',           85000],
            ['Uwell Caliburn G2 Pod',           '2ml refillable pod replacement pack',           65000],
            ['18650 Battery Samsung 25R',       '2500mAh rechargeable battery for box mods',     90000],
        ];

        foreach ($products as [$name, $description, $price]) {
            Product::updateOrCreate(
                ['name' => $name],
                ['description' => $description, 'price' => $price],
            );
        }
    }
}
