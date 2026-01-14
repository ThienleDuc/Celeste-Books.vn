<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WeightFee extends Model
{
    use HasFactory;

    protected $table = 'weight_fees';
    protected $fillable = [
        'min_weight',
        'max_weight',
        'multiplier',
        'created_at',
    ];
}
