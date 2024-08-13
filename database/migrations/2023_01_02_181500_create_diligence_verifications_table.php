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
        Schema::create('diligence_verifications', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('receptionist_id')->nullable();
            $table->string('eitc')->nullable();
            $table->string('ctc')->nullable();
            $table->string('actc')->nullable();
            $table->string('aotc')->nullable();
            $table->string('irs_notes')->nullable();
            $table->string('signature')->nullable();
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
        Schema::dropIfExists('diligence_verifications');
    }
};
