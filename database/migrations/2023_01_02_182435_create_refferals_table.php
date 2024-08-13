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
        Schema::create('refferals', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('receptionist_id')->nullable();
            $table->string('name')->nullable();
            $table->string('phone')->nullable();
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
        Schema::dropIfExists('refferals');
    }
};
