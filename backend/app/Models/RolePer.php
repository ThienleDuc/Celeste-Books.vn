<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RolePer extends Model
{
    protected $table = 'role_per';
    protected $primaryKey = null; // Pivot table without single primary key
    public $incrementing = false;

    protected $fillable = [
        'per_id',
        'role_id',
    ];
}
