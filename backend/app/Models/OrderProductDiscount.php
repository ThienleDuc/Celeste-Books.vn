<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property string|null $type
 * @property string $amount
 * @property int $quantity
 * @property int $used_quantity
 * @property string|null $created_at
 * @method static \Illuminate\Database\Eloquent\Builder|OrderProductDiscount newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|OrderProductDiscount newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|OrderProductDiscount query()
 * @method static \Illuminate\Database\Eloquent\Builder|OrderProductDiscount whereAmount($value)
 * @method static \Illuminate\Database\Eloquent\Builder|OrderProductDiscount whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|OrderProductDiscount whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|OrderProductDiscount whereQuantity($value)
 * @method static \Illuminate\Database\Eloquent\Builder|OrderProductDiscount whereType($value)
 * @method static \Illuminate\Database\Eloquent\Builder|OrderProductDiscount whereUsedQuantity($value)
 * @mixin \Eloquent
 */
class OrderProductDiscount extends Model
{
    use HasFactory;

    protected $table = 'order_product_discounts';
    protected $fillable = [
        'type',
        'amount',
        'created_at'
    ];

    public $timestamps = false;
}
