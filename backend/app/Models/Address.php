<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property string|null $user_id
 * @property string|null $label
 * @property string|null $receiver_name
 * @property string|null $phone
 * @property string|null $street_address
 * @property int|null $commune_id
 * @property int|null $is_default
 * @property string|null $created_at
 * @property-read \App\Models\User|null $user
 * @method static \Illuminate\Database\Eloquent\Builder|Address newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|Address newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|Address query()
 * @method static \Illuminate\Database\Eloquent\Builder|Address whereCommuneId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Address whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Address whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Address whereIsDefault($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Address whereLabel($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Address wherePhone($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Address whereReceiverName($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Address whereStreetAddress($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Address whereUserId($value)
 * @mixin \Eloquent
 */
class Address extends Model
{
    protected $table = 'addresses';
    protected $primaryKey = 'id';
    public $incrementing = true;
    protected $keyType = 'int';

    protected $fillable = [
        'user_id',
        'label',
        'receiver_name',
        'phone',
        'street_address',
        'commune_id',
        'is_default',
        'created_at',
    ];
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id', 'id');
    }
     public $timestamps = false;
}
