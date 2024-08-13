<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('internal_audits', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('receptionist_id')->nullable();
            $table->string('failed')->nullable();
            $table->string('intentional_failed')->nullable();
            $table->string('passed')->nullable();
            $table->foreign('receptionist_id')->references('id')->on('receptionists')->onDelete('cascade');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('internal_audits');
    }
};
