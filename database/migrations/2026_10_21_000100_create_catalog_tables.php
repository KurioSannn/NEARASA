<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('businesses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('owner_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('slug')->unique();
            $table->string('name');
            $table->text('description');
            $table->string('kind');
            $table->string('photo');
            $table->string('whatsapp')->nullable();
            $table->string('status')->default('published')->index();
            $table->boolean('is_demo')->default(false);
            $table->timestamps();
        });
        Schema::create('menu_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('business_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('group');
            $table->string('category');
            $table->unsignedInteger('price');
            $table->string('photo')->nullable();
            $table->boolean('sold_out')->default(false);
            $table->timestamps();
        });
        Schema::create('selling_posts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('business_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('address');
            $table->string('landmark')->default('');
            $table->double('latitude');
            $table->double('longitude');
            $table->timestamps();
        });
        Schema::create('weekly_schedules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('selling_post_id')->constrained()->cascadeOnDelete();
            $table->unsignedTinyInteger('weekday');
            $table->string('opens_at', 5);
            $table->string('closes_at', 5);
            $table->unique(['selling_post_id', 'weekday', 'opens_at']);
        });
        Schema::create('schedule_exceptions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('selling_post_id')->constrained()->cascadeOnDelete();
            $table->date('date');
            $table->unique(['selling_post_id', 'date']);
        });
    }

    public function down(): void
    {
        foreach (['schedule_exceptions', 'weekly_schedules', 'selling_posts', 'menu_items', 'businesses'] as $table) {
            Schema::dropIfExists($table);
        }
    }
};
