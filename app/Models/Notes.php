<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Notes extends Model
{
    use HasFactory;
    protected $guarded = [];

    public function place(){
        return $this->belongsTo(place::class, 'place_id');
    }
}
