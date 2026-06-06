<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->string('name', 255);
            $table->text('description')->nullable();
            // Price is DECIMAL(10,2) in IDR. The CHECK constraint is added below
            // because Blueprint doesn't have a typed "decimal + check" helper.
            $table->decimal('price', 10, 2);
            $table->timestamps();
        });

        DB::statement('ALTER TABLE products ADD CONSTRAINT products_price_check CHECK (price >= 0)');
        // Unique on name so the NestJS seed script's ON CONFLICT (name) works.
        DB::statement('CREATE UNIQUE INDEX products_name_unique ON products(name)');
    }

    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
