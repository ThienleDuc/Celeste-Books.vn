<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * @property string $user_id
 * @property string|null $full_name
 * @property string|null $avatar_url
 * @property string|null $phone
 * @property string|null $birthday
 * @property string|null $gender
 * @property-read \App\Models\User $user
 * @method static \Illuminate\Database\Eloquent\Builder|Profile newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|Profile newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|Profile query()
 * @method static \Illuminate\Database\Eloquent\Builder|Profile whereAvatarUrl($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Profile whereBirthday($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Profile whereFullName($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Profile whereGender($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Profile wherePhone($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Profile whereUserId($value)
 * @mixin \Eloquent
 */
class Profile extends Model
{
    protected $table = 'profiles';
    protected $primaryKey = 'user_id';
    public $incrementing = false;
    protected $keyType = 'string';

    Public $timestamps = false;

    protected $fillable = [
        'user_id',
        'full_name',
        'avatar_url',
        'phone',
        'birthday',
        'gender',
    ];
     public function user()
    {
        return $this->belongsTo(User::class, 'user_id', 'id');
    }
    
}

