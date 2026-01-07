<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Commune extends Model
{
    protected $table = 'communes';
    protected $primaryKey = 'id';
    public $incrementing = false;
    protected $keyType = 'int';

    protected $fillable = [
        'id',
        'province_id',
        'name',
        'code',
    ];
     public function addresses()
    {
        return $this->hasMany(Address::class, 'commune_id', 'id');
    }
      public function province()
    {
        return $this->belongsTo(Province::class, 'province_id', 'id');
    }

}
