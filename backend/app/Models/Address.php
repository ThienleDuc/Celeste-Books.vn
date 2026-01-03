<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

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
