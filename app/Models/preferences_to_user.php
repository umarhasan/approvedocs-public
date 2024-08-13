<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class preferences_to_user extends Model
{
    use HasFactory;
	
	protected $casts = [
        'preferences'=>'array',
    ];
}
