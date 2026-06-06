<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        // Default admin user for the Filament panel.
        User::updateOrCreate(
            ['email' => 'admin@vapebay.local'],
            [
                'name' => 'VapeBay Admin',
                'password' => Hash::make('password'),
            ],
        );

        $this->call(ProductSeeder::class);
    }
}
