<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('businesses', function (Blueprint $table) {
            $table->string('business_category', 120)->nullable();
            $table->json('additional_categories')->nullable();
            $table->date('opened_on')->nullable();
            $table->string('phone', 30)->nullable();
            $table->string('contact_email')->nullable();
            $table->string('website', 2048)->nullable();
            $table->json('social_links')->nullable();
            $table->json('action_links')->nullable();
            $table->string('logo')->nullable();
            $table->string('menu_pdf')->nullable();
        });
        Schema::table('menu_items', fn (Blueprint $table) => $table->text('description')->nullable());
        Schema::table('selling_posts', function (Blueprint $table) {
            $table->json('service_options')->nullable();
            $table->json('facilities')->nullable();
            $table->json('payment_methods')->nullable();
            $table->string('service_area')->nullable();
            $table->string('operating_status')->default('operating');
            $table->string('closure_note')->nullable();
        });
        Schema::table('weekly_schedules', fn (Blueprint $table) => $table->boolean('all_day')->default(false));
        Schema::table('schedule_exceptions', function (Blueprint $table) {
            $table->boolean('is_closed')->default(true);
            $table->boolean('all_day')->default(false);
            $table->string('opens_at', 5)->nullable();
            $table->string('closes_at', 5)->nullable();
        });
        Schema::create('business_photos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('business_id')->constrained()->cascadeOnDelete();
            $table->string('photo');
            $table->string('caption')->default('');
            $table->string('kind')->default('other');
            $table->timestamps();
        });
        Schema::create('business_updates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('business_id')->constrained()->cascadeOnDelete();
            $table->string('type')->default('update');
            $table->string('title', 120);
            $table->text('body');
            $table->string('photo')->nullable();
            $table->date('starts_on')->nullable();
            $table->date('ends_on')->nullable();
            $table->string('cta_label', 50)->nullable();
            $table->string('cta_url', 2048)->nullable();
            $table->boolean('is_published')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('business_updates');
        Schema::dropIfExists('business_photos');
        Schema::table('schedule_exceptions', fn (Blueprint $table) => $table->dropColumn(['is_closed', 'all_day', 'opens_at', 'closes_at']));
        Schema::table('weekly_schedules', fn (Blueprint $table) => $table->dropColumn('all_day'));
        Schema::table('selling_posts', fn (Blueprint $table) => $table->dropColumn(['service_options', 'facilities', 'payment_methods', 'service_area', 'operating_status', 'closure_note']));
        Schema::table('menu_items', fn (Blueprint $table) => $table->dropColumn('description'));
        Schema::table('businesses', fn (Blueprint $table) => $table->dropColumn(['business_category', 'additional_categories', 'opened_on', 'phone', 'contact_email', 'website', 'social_links', 'action_links', 'logo', 'menu_pdf']));
    }
};
