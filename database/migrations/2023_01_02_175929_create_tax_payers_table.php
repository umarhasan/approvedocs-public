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
        Schema::create('tax_payers', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('receptionist_id')->nullable();
            $table->string('spouse_information')->nullable();
            $table->string('address')->nullable();
            $table->string('dependent')->nullable();
            $table->string('tax_document')->nullable();
            $table->string('paystub')->nullable();
            $table->string('w2')->nullable();
            $table->string('nec')->nullable();
            $table->string('morgage')->nullable();
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
        Schema::dropIfExists('tax_payers');
    }
};
