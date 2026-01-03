<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DistanceFee extends Model
{
    use HasFactory;

    protected $table = 'distance_fees';
    protected $fillable = [
        'min_distance',
        'max_distance',
        'multiplier',
        'created_at',
    ];
}
