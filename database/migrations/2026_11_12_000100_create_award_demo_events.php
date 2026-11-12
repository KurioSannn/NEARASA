<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Isolated demo fixture: never mix simulated award activity into real interaction_events.
        Schema::create('award_demo_events', function (Blueprint $table) {
            $table->id();
            $table->foreignId('business_id')->constrained()->cascadeOnDelete();
            $table->foreignId('selling_post_id')->constrained()->cascadeOnDelete();
            $table->string('visitor_key', 100);
            $table->string('type', 30);
            $table->timestamp('occurred_at'); // UTC
            $table->index(['business_id', 'occurred_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('award_demo_events');
    }
};
