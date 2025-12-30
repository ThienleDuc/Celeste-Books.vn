<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ShippingTypeFee extends Model
{
    use HasFactory;

    protected $table = 'shipping_type_fees';
    protected $fillable = [
        'shipping_type',
        'multiplier',
        'created_at',
    ];
}
