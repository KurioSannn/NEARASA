<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('menu_item_post_availability', function (Blueprint $table) {
            $table->foreignId('menu_item_id')->constrained()->cascadeOnDelete();
            $table->foreignId('selling_post_id')->constrained()->cascadeOnDelete();
            $table->boolean('sold_out');
            $table->timestamps();
            $table->primary(['menu_item_id', 'selling_post_id']);
        });
        Schema::table('selling_posts', function (Blueprint $table) {
            $table->dateTime('today_opens_at')->nullable();
            $table->dateTime('today_closes_at')->nullable();
            $table->dateTime('hours_updated_at')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('selling_posts', fn (Blueprint $table) => $table->dropColumn(['today_opens_at', 'today_closes_at', 'hours_updated_at']));
        Schema::dropIfExists('menu_item_post_availability');
    }
};
