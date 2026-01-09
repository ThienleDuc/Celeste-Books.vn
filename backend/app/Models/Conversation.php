<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * @mixin IdeHelperConversation
 */
class Conversation extends Model
{
    protected $table = 'conversations';
    protected $primaryKey ='id';
    public $incrementing =true;
    protected $keyType = 'int';
    public $timestamps = false; 
    protected $fillable = [
            'participant1_id',
            'participant2_id',
            'product_id',
            'order_item_id',
            'last_message_at',
            'visible_to_p1', 
            'visible_to_p2',
            'created_at',
    ];
    public function messages() {
        return $this->hasMany(Message::class);
    }
    public function participant1() {
        return $this->belongsTo(User::class, 'participant1_id');
    }
    public function participant2() {
        return $this->belongsTo(User::class, 'participant2_id');
    }
    public function product() {
        return $this->belongsTo(Product::class);
    }
    
}
