<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Province extends Model
{
    protected $table = 'provinces';
    protected $primaryKey = 'id';
    public $incrementing = false;
    protected $keyType = 'int';

    protected $fillable = [
        'id',
        'name',
        'code',
    ];
     public function communes()
    {
        return $this->hasMany(Commune::class, 'province_id', 'id');
    }

    /**
     * Relationship với Address thông qua Commune
     */
    public function addresses()
    {
        return $this->hasManyThrough(
            Address::class,
            Commune::class,
            'province_id', // Foreign key on communes table
            'commune_id', // Foreign key on addresses table
            'id', // Local key on provinces table
            'id' // Local key on communes table
        );
    }
     public $timestamps = false;
}
