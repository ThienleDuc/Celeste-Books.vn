<?php

// @formatter:off
// phpcs:ignoreFile
/**
 * A helper file for your Eloquent Models
 * Copy the phpDocs from this file to the correct Model,
 * And remove them from this file, to prevent double declarations.
 *
 * @author Barry vd. Heuvel <barryvdh@gmail.com>
 */


namespace App\Models{
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
 * @property-read \App\Models\Commune|null $commune
 * @property-read \App\Models\Province|null $province
 * @mixin \Eloquent
 */
	#[\AllowDynamicProperties]
	class IdeHelperAddress {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int|null $cart_id
 * @property int|null $product_id
 * @property int|null $product_details_id
 * @property int $quantity
 * @property string|null $price_at_time
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @method static \Illuminate\Database\Eloquent\Builder|CartItem newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|CartItem newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|CartItem query()
 * @method static \Illuminate\Database\Eloquent\Builder|CartItem whereCartId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|CartItem whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|CartItem whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|CartItem wherePriceAtTime($value)
 * @method static \Illuminate\Database\Eloquent\Builder|CartItem whereProductDetailsId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|CartItem whereProductId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|CartItem whereQuantity($value)
 * @method static \Illuminate\Database\Eloquent\Builder|CartItem whereUpdatedAt($value)
 * @mixin \Eloquent
 */
	#[\AllowDynamicProperties]
	class IdeHelperCartItem {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string|null $name
 * @property string|null $slug
 * @property string|null $created_at
 * @method static \Illuminate\Database\Eloquent\Builder|Category newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|Category newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|Category query()
 * @method static \Illuminate\Database\Eloquent\Builder|Category whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Category whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Category whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Category whereSlug($value)
 * @mixin \Eloquent
 */
	#[\AllowDynamicProperties]
	class IdeHelperCategory {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int|null $province_id
 * @property string|null $name
 * @property string|null $code
 * @method static \Illuminate\Database\Eloquent\Builder|Commune newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|Commune newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|Commune query()
 * @method static \Illuminate\Database\Eloquent\Builder|Commune whereCode($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Commune whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Commune whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Commune whereProvinceId($value)
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Address> $addresses
 * @property-read int|null $addresses_count
 * @property-read \App\Models\Province|null $province
 * @mixin \Eloquent
 */
	#[\AllowDynamicProperties]
	class IdeHelperCommune {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string $participant1_id
 * @property string $participant2_id
 * @property int|null $product_id
 * @property int|null $order_item_id
 * @property string|null $last_message_at
 * @property string|null $created_at
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Message> $messages
 * @property-read int|null $messages_count
 * @property-read \App\Models\User $participant1
 * @property-read \App\Models\User $participant2
 * @property-read \App\Models\Product|null $product
 * @method static \Illuminate\Database\Eloquent\Builder|Conversation newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|Conversation newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|Conversation query()
 * @method static \Illuminate\Database\Eloquent\Builder|Conversation whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Conversation whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Conversation whereLastMessageAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Conversation whereOrderItemId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Conversation whereParticipant1Id($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Conversation whereParticipant2Id($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Conversation whereProductId($value)
 * @mixin \Eloquent
 */
	#[\AllowDynamicProperties]
	class IdeHelperConversation {}
}

namespace App\Models{
/**
 * @method static \Illuminate\Database\Eloquent\Builder|MessageNotification newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|MessageNotification newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|MessageNotification query()
 * @property int $id
 * @property int $conversation_id
 * @property string|null $user_id
 * @property string|null $type
 * @property string $title
 * @property string|null $content
 * @property int|null $unread_count
 * @property int|null $is_read
 * @property int|null $last_message_id
 * @property string|null $created_at
 * @property string|null $updated_at
 * @method static \Illuminate\Database\Eloquent\Builder|ConversationNotification whereContent($value)
 * @method static \Illuminate\Database\Eloquent\Builder|ConversationNotification whereConversationId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|ConversationNotification whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|ConversationNotification whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|ConversationNotification whereIsRead($value)
 * @method static \Illuminate\Database\Eloquent\Builder|ConversationNotification whereLastMessageId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|ConversationNotification whereTitle($value)
 * @method static \Illuminate\Database\Eloquent\Builder|ConversationNotification whereType($value)
 * @method static \Illuminate\Database\Eloquent\Builder|ConversationNotification whereUnreadCount($value)
 * @method static \Illuminate\Database\Eloquent\Builder|ConversationNotification whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|ConversationNotification whereUserId($value)
 * @mixin \Eloquent
 */
	#[\AllowDynamicProperties]
	class IdeHelperConversationNotification {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string $min_distance
 * @property string $max_distance
 * @property string $multiplier
 * @property \Illuminate\Support\Carbon|null $created_at
 * @method static \Illuminate\Database\Eloquent\Builder|DistanceFee newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|DistanceFee newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|DistanceFee query()
 * @method static \Illuminate\Database\Eloquent\Builder|DistanceFee whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|DistanceFee whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|DistanceFee whereMaxDistance($value)
 * @method static \Illuminate\Database\Eloquent\Builder|DistanceFee whereMinDistance($value)
 * @method static \Illuminate\Database\Eloquent\Builder|DistanceFee whereMultiplier($value)
 * @mixin \Eloquent
 */
	#[\AllowDynamicProperties]
	class IdeHelperDistanceFee {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $conversation_id
 * @property string $sender_id
 * @property string $message
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property-read \App\Models\User|null $receiver
 * @property-read \App\Models\User $sender
 * @method static \Illuminate\Database\Eloquent\Builder|Message newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|Message newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|Message query()
 * @method static \Illuminate\Database\Eloquent\Builder|Message whereConversationId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Message whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Message whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Message whereMessage($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Message whereSenderId($value)
 * @mixin \Eloquent
 */
	#[\AllowDynamicProperties]
	class IdeHelperMessage {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string|null $user_id
 * @property string $order_code
 * @property string $status
 * @property string|null $subtotal
 * @property string|null $shipping_fee
 * @property string|null $discount
 * @property string $total_amount
 * @property int|null $shipping_address_id
 * @property string $payment_method
 * @property string $payment_status
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @method static \Illuminate\Database\Eloquent\Builder|Order newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|Order newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|Order query()
 * @method static \Illuminate\Database\Eloquent\Builder|Order whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Order whereDiscount($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Order whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Order whereOrderCode($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Order wherePaymentMethod($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Order wherePaymentStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Order whereShippingAddressId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Order whereShippingFee($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Order whereStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Order whereSubtotal($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Order whereTotalAmount($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Order whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Order whereUserId($value)
 * @mixin \Eloquent
 */
	#[\AllowDynamicProperties]
	class IdeHelperOrder {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $order_id
 * @property int|null $product_discount_id
 * @property int|null $shipping_discount_id
 * @property string $amount
 * @property-read \App\Models\Order $order
 * @property-read \App\Models\OrderProductDiscount|null $productDiscount
 * @property-read \App\Models\OrderShippingDiscount|null $shippingDiscount
 * @method static \Illuminate\Database\Eloquent\Builder|OrderDiscountDetail newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|OrderDiscountDetail newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|OrderDiscountDetail query()
 * @method static \Illuminate\Database\Eloquent\Builder|OrderDiscountDetail whereAmount($value)
 * @method static \Illuminate\Database\Eloquent\Builder|OrderDiscountDetail whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|OrderDiscountDetail whereOrderId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|OrderDiscountDetail whereProductDiscountId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|OrderDiscountDetail whereShippingDiscountId($value)
 * @mixin \Eloquent
 */
	#[\AllowDynamicProperties]
	class IdeHelperOrderDiscountDetail {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int|null $order_id
 * @property int|null $product_id
 * @property int|null $product_details_id
 * @property string|null $product_type
 * @property int|null $quantity
 * @property string|null $price
 * @property string|null $total_price
 * @property \Illuminate\Support\Carbon|null $created_at
 * @method static \Illuminate\Database\Eloquent\Builder|OrderItem newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|OrderItem newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|OrderItem query()
 * @method static \Illuminate\Database\Eloquent\Builder|OrderItem whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|OrderItem whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|OrderItem whereOrderId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|OrderItem wherePrice($value)
 * @method static \Illuminate\Database\Eloquent\Builder|OrderItem whereProductDetailsId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|OrderItem whereProductId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|OrderItem whereProductType($value)
 * @method static \Illuminate\Database\Eloquent\Builder|OrderItem whereQuantity($value)
 * @method static \Illuminate\Database\Eloquent\Builder|OrderItem whereTotalPrice($value)
 * @mixin \Eloquent
 */
	#[\AllowDynamicProperties]
	class IdeHelperOrderItem {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string|null $user_id
 * @property int|null $order_id
 * @property string|null $type
 * @property string|null $title
 * @property string|null $content
 * @property int|null $is_read
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @method static \Illuminate\Database\Eloquent\Builder|OrderNotification newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|OrderNotification newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|OrderNotification query()
 * @method static \Illuminate\Database\Eloquent\Builder|OrderNotification whereContent($value)
 * @method static \Illuminate\Database\Eloquent\Builder|OrderNotification whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|OrderNotification whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|OrderNotification whereIsRead($value)
 * @method static \Illuminate\Database\Eloquent\Builder|OrderNotification whereOrderId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|OrderNotification whereTitle($value)
 * @method static \Illuminate\Database\Eloquent\Builder|OrderNotification whereType($value)
 * @method static \Illuminate\Database\Eloquent\Builder|OrderNotification whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|OrderNotification whereUserId($value)
 * @mixin \Eloquent
 */
	#[\AllowDynamicProperties]
	class IdeHelperOrderNotification {}
}

namespace App\Models{
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
	#[\AllowDynamicProperties]
	class IdeHelperOrderProductDiscount {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string|null $type
 * @property string $amount
 * @property int $quantity
 * @property int $used_quantity
 * @property string|null $created_at
 * @method static \Illuminate\Database\Eloquent\Builder|OrderShippingDiscount newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|OrderShippingDiscount newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|OrderShippingDiscount query()
 * @method static \Illuminate\Database\Eloquent\Builder|OrderShippingDiscount whereAmount($value)
 * @method static \Illuminate\Database\Eloquent\Builder|OrderShippingDiscount whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|OrderShippingDiscount whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|OrderShippingDiscount whereQuantity($value)
 * @method static \Illuminate\Database\Eloquent\Builder|OrderShippingDiscount whereType($value)
 * @method static \Illuminate\Database\Eloquent\Builder|OrderShippingDiscount whereUsedQuantity($value)
 * @mixin \Eloquent
 */
	#[\AllowDynamicProperties]
	class IdeHelperOrderShippingDiscount {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $order_id
 * @property int $weight_fee_id
 * @property int $distance_fee_id
 * @property int $shipping_type_fee_id
 * @property string $amount
 * @property-read \App\Models\DistanceFee $distanceFee
 * @property-read \App\Models\Order $order
 * @property-read \App\Models\ShippingTypeFee $shippingTypeFee
 * @property-read \App\Models\WeightFee $weightFee
 * @method static \Illuminate\Database\Eloquent\Builder|OrderShippingFeeDetail newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|OrderShippingFeeDetail newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|OrderShippingFeeDetail query()
 * @method static \Illuminate\Database\Eloquent\Builder|OrderShippingFeeDetail whereAmount($value)
 * @method static \Illuminate\Database\Eloquent\Builder|OrderShippingFeeDetail whereDistanceFeeId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|OrderShippingFeeDetail whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|OrderShippingFeeDetail whereOrderId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|OrderShippingFeeDetail whereShippingTypeFeeId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|OrderShippingFeeDetail whereWeightFeeId($value)
 * @mixin \Eloquent
 */
	#[\AllowDynamicProperties]
	class IdeHelperOrderShippingFeeDetail {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string|null $name
 * @property string|null $description
 * @property string|null $slug
 * @method static \Illuminate\Database\Eloquent\Builder|Permission newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|Permission newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|Permission query()
 * @method static \Illuminate\Database\Eloquent\Builder|Permission whereDescription($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Permission whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Permission whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Permission whereSlug($value)
 * @mixin \Eloquent
 */
	#[\AllowDynamicProperties]
	class IdeHelperPermission {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string $name
 * @property string|null $slug
 * @property string|null $description
 * @property string|null $author
 * @property string|null $publisher
 * @property int|null $publication_year
 * @property string|null $language
 * @property bool|null $status
 * @property int|null $views
 * @property int|null $purchase_count
 * @property float|null $rating
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Category> $categories
 * @property-read int|null $categories_count
 * @property-read \App\Models\ProductDetail|null $detail
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\ProductImage> $images
 * @property-read int|null $images_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\OrderItem> $orderItems
 * @property-read int|null $order_items_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Review> $reviews
 * @property-read int|null $reviews_count
 * @method static \Illuminate\Database\Eloquent\Builder|Product active()
 * @method static \Illuminate\Database\Eloquent\Builder|Product newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|Product newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|Product query()
 * @method static \Illuminate\Database\Eloquent\Builder|Product search($search)
 * @method static \Illuminate\Database\Eloquent\Builder|Product whereAuthor($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Product whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Product whereDescription($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Product whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Product whereLanguage($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Product whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Product wherePublicationYear($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Product wherePublisher($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Product wherePurchaseCount($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Product whereRating($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Product whereSlug($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Product whereStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Product whereViews($value)
 * @mixin \Eloquent
 */
	#[\AllowDynamicProperties]
	class IdeHelperProduct {}
}

namespace App\Models{
/**
 * @property int $product_id
 * @property int $category_id
 * @method static \Illuminate\Database\Eloquent\Builder|ProductCategory newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|ProductCategory newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|ProductCategory query()
 * @method static \Illuminate\Database\Eloquent\Builder|ProductCategory whereCategoryId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|ProductCategory whereProductId($value)
 * @mixin \Eloquent
 */
	#[\AllowDynamicProperties]
	class IdeHelperProductCategory {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int|null $product_id
 * @property string|null $product_type
 * @property string|null $sku
 * @property string|null $original_price
 * @property string|null $sale_price
 * @property int|null $stock
 * @property string|null $file_url
 * @property string|null $weight
 * @property string|null $length
 * @property string|null $width
 * @property string|null $height
 * @property string|null $created_at
 * @method static \Illuminate\Database\Eloquent\Builder|ProductDetail newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|ProductDetail newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|ProductDetail query()
 * @method static \Illuminate\Database\Eloquent\Builder|ProductDetail whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|ProductDetail whereFileUrl($value)
 * @method static \Illuminate\Database\Eloquent\Builder|ProductDetail whereHeight($value)
 * @method static \Illuminate\Database\Eloquent\Builder|ProductDetail whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|ProductDetail whereLength($value)
 * @method static \Illuminate\Database\Eloquent\Builder|ProductDetail whereOriginalPrice($value)
 * @method static \Illuminate\Database\Eloquent\Builder|ProductDetail whereProductId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|ProductDetail whereProductType($value)
 * @method static \Illuminate\Database\Eloquent\Builder|ProductDetail whereSalePrice($value)
 * @method static \Illuminate\Database\Eloquent\Builder|ProductDetail whereSku($value)
 * @method static \Illuminate\Database\Eloquent\Builder|ProductDetail whereStock($value)
 * @method static \Illuminate\Database\Eloquent\Builder|ProductDetail whereWeight($value)
 * @method static \Illuminate\Database\Eloquent\Builder|ProductDetail whereWidth($value)
 * @mixin \Eloquent
 */
	#[\AllowDynamicProperties]
	class IdeHelperProductDetail {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $product_id
 * @property string|null $image_url
 * @property int|null $is_primary
 * @property int|null $sort_order
 * @property string|null $created_at
 * @method static \Illuminate\Database\Eloquent\Builder|ProductImage newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|ProductImage newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|ProductImage query()
 * @method static \Illuminate\Database\Eloquent\Builder|ProductImage whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|ProductImage whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|ProductImage whereImageUrl($value)
 * @method static \Illuminate\Database\Eloquent\Builder|ProductImage whereIsPrimary($value)
 * @method static \Illuminate\Database\Eloquent\Builder|ProductImage whereProductId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|ProductImage whereSortOrder($value)
 * @mixin \Eloquent
 */
	#[\AllowDynamicProperties]
	class IdeHelperProductImage {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string|null $user_id
 * @property int|null $product_id
 * @property string|null $type
 * @property string|null $title
 * @property string|null $content
 * @property int|null $is_read
 * @property string|null $created_at
 * @property string|null $updated_at
 * @method static \Illuminate\Database\Eloquent\Builder|ProductNotification newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|ProductNotification newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|ProductNotification query()
 * @method static \Illuminate\Database\Eloquent\Builder|ProductNotification whereContent($value)
 * @method static \Illuminate\Database\Eloquent\Builder|ProductNotification whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|ProductNotification whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|ProductNotification whereIsRead($value)
 * @method static \Illuminate\Database\Eloquent\Builder|ProductNotification whereProductId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|ProductNotification whereTitle($value)
 * @method static \Illuminate\Database\Eloquent\Builder|ProductNotification whereType($value)
 * @method static \Illuminate\Database\Eloquent\Builder|ProductNotification whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|ProductNotification whereUserId($value)
 * @mixin \Eloquent
 */
	#[\AllowDynamicProperties]
	class IdeHelperProductNotification {}
}

namespace App\Models{
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
	#[\AllowDynamicProperties]
	class IdeHelperProfile {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string|null $name
 * @property string|null $code
 * @method static \Illuminate\Database\Eloquent\Builder|Province newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|Province newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|Province query()
 * @method static \Illuminate\Database\Eloquent\Builder|Province whereCode($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Province whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Province whereName($value)
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Address> $addresses
 * @property-read int|null $addresses_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Commune> $communes
 * @property-read int|null $communes_count
 * @mixin \Eloquent
 */
	#[\AllowDynamicProperties]
	class IdeHelperProvince {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int|null $order_item_id
 * @property string $user_id
 * @property int|null $rating
 * @property string|null $title
 * @property string|null $content
 * @property string|null $images
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @method static \Illuminate\Database\Eloquent\Builder|Review newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|Review newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|Review query()
 * @method static \Illuminate\Database\Eloquent\Builder|Review whereContent($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Review whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Review whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Review whereImages($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Review whereOrderItemId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Review whereRating($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Review whereTitle($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Review whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Review whereUserId($value)
 * @mixin \Eloquent
 */
	#[\AllowDynamicProperties]
	class IdeHelperReview {}
}

namespace App\Models{
/**
 * @property int $id
 * @property int $review_id
 * @property string|null $image_url
 * @property \Illuminate\Support\Carbon|null $created_at
 * @method static \Illuminate\Database\Eloquent\Builder|ReviewImage newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|ReviewImage newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|ReviewImage query()
 * @method static \Illuminate\Database\Eloquent\Builder|ReviewImage whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|ReviewImage whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|ReviewImage whereImageUrl($value)
 * @method static \Illuminate\Database\Eloquent\Builder|ReviewImage whereReviewId($value)
 * @mixin \Eloquent
 */
	#[\AllowDynamicProperties]
	class IdeHelperReviewImage {}
}

namespace App\Models{
/**
 * @property string $id
 * @property string|null $name
 * @property string|null $description
 * @property string|null $slug
 * @method static \Illuminate\Database\Eloquent\Builder|Role newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|Role newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|Role query()
 * @method static \Illuminate\Database\Eloquent\Builder|Role whereDescription($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Role whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Role whereName($value)
 * @method static \Illuminate\Database\Eloquent\Builder|Role whereSlug($value)
 * @mixin \Eloquent
 */
	#[\AllowDynamicProperties]
	class IdeHelperRole {}
}

namespace App\Models{
/**
 * @property int $per_id
 * @property string $role_id
 * @method static \Illuminate\Database\Eloquent\Builder|RolePer newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|RolePer newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|RolePer query()
 * @method static \Illuminate\Database\Eloquent\Builder|RolePer wherePerId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|RolePer whereRoleId($value)
 * @mixin \Eloquent
 */
	#[\AllowDynamicProperties]
	class IdeHelperRolePer {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string $shipping_type
 * @property string $multiplier
 * @property \Illuminate\Support\Carbon|null $created_at
 * @method static \Illuminate\Database\Eloquent\Builder|ShippingTypeFee newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|ShippingTypeFee newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|ShippingTypeFee query()
 * @method static \Illuminate\Database\Eloquent\Builder|ShippingTypeFee whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|ShippingTypeFee whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|ShippingTypeFee whereMultiplier($value)
 * @method static \Illuminate\Database\Eloquent\Builder|ShippingTypeFee whereShippingType($value)
 * @mixin \Eloquent
 */
	#[\AllowDynamicProperties]
	class IdeHelperShippingTypeFee {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string|null $user_id
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property string|null $status
 * @property \Illuminate\Support\Carbon|null $updated_at
 * @method static \Illuminate\Database\Eloquent\Builder|ShoppingCart newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|ShoppingCart newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|ShoppingCart query()
 * @method static \Illuminate\Database\Eloquent\Builder|ShoppingCart whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|ShoppingCart whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|ShoppingCart whereStatus($value)
 * @method static \Illuminate\Database\Eloquent\Builder|ShoppingCart whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|ShoppingCart whereUserId($value)
 * @mixin \Eloquent
 */
	#[\AllowDynamicProperties]
	class IdeHelperShoppingCart {}
}

namespace App\Models{
/**
 * @property string $id
 * @property string $username
 * @property string|null $password_hash
 * @property string|null $email
 * @property bool|null $is_active
 * @property \Illuminate\Support\Carbon|null $created_at
 * @property string|null $role_id
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Address> $addresses
 * @property-read int|null $addresses_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\UserNotification> $notifications
 * @property-read int|null $notifications_count
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \App\Models\Order> $orders
 * @property-read int|null $orders_count
 * @property-read \App\Models\Profile|null $profile
 * @property-read \App\Models\Role|null $role
 * @property-read \Illuminate\Database\Eloquent\Collection<int, \Laravel\Sanctum\PersonalAccessToken> $tokens
 * @property-read int|null $tokens_count
 * @method static \Database\Factories\UserFactory factory($count = null, $state = [])
 * @method static \Illuminate\Database\Eloquent\Builder|User newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|User newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|User query()
 * @method static \Illuminate\Database\Eloquent\Builder|User whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|User whereEmail($value)
 * @method static \Illuminate\Database\Eloquent\Builder|User whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|User whereIsActive($value)
 * @method static \Illuminate\Database\Eloquent\Builder|User wherePasswordHash($value)
 * @method static \Illuminate\Database\Eloquent\Builder|User whereRoleId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|User whereUsername($value)
 * @mixin \Eloquent
 */
	#[\AllowDynamicProperties]
	class IdeHelperUser {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string|null $user_id
 * @property string|null $type
 * @property string|null $title
 * @property string|null $content
 * @property int|null $is_read
 * @property string|null $created_at
 * @property string|null $updated_at
 * @method static \Illuminate\Database\Eloquent\Builder|UserNotification newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|UserNotification newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|UserNotification query()
 * @method static \Illuminate\Database\Eloquent\Builder|UserNotification whereContent($value)
 * @method static \Illuminate\Database\Eloquent\Builder|UserNotification whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|UserNotification whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|UserNotification whereIsRead($value)
 * @method static \Illuminate\Database\Eloquent\Builder|UserNotification whereTitle($value)
 * @method static \Illuminate\Database\Eloquent\Builder|UserNotification whereType($value)
 * @method static \Illuminate\Database\Eloquent\Builder|UserNotification whereUpdatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|UserNotification whereUserId($value)
 * @mixin \Eloquent
 */
	#[\AllowDynamicProperties]
	class IdeHelperUserNotification {}
}

namespace App\Models{
/**
 * @property int $id
 * @property string $min_weight
 * @property string $max_weight
 * @property string $base_price
 * @property \Illuminate\Support\Carbon|null $created_at
 * @method static \Illuminate\Database\Eloquent\Builder|WeightFee newModelQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|WeightFee newQuery()
 * @method static \Illuminate\Database\Eloquent\Builder|WeightFee query()
 * @method static \Illuminate\Database\Eloquent\Builder|WeightFee whereBasePrice($value)
 * @method static \Illuminate\Database\Eloquent\Builder|WeightFee whereCreatedAt($value)
 * @method static \Illuminate\Database\Eloquent\Builder|WeightFee whereId($value)
 * @method static \Illuminate\Database\Eloquent\Builder|WeightFee whereMaxWeight($value)
 * @method static \Illuminate\Database\Eloquent\Builder|WeightFee whereMinWeight($value)
 * @mixin \Eloquent
 */
	#[\AllowDynamicProperties]
	class IdeHelperWeightFee {}
}

