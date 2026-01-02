<?php

namespace App\Http\Controllers;

use App\Models\Address;
use App\Models\UserNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AddressController extends Controller
{
public function update(Request $request, $userId)
{
    $request->validate([
        'label'          => 'nullable|string|max:50',
        'receiver_name'  => 'nullable|string|max:255',
        'phone'          => 'nullable|string|max:20',
        'street_address' => 'nullable|string|max:255',
        'commune_id'     => 'nullable|exists:communes,id',
        'is_default'     => 'nullable|boolean',
    ]);

    // 🔹 LẤY DATA THỰC SỰ GỬI LÊN
    $data = array_filter(
        $request->only([
            'label',
            'receiver_name',
            'phone',
            'street_address',
            'commune_id',
            'is_default',
        ]),
        fn ($value) => !is_null($value)
    );

    // ❌ KHÔNG CÓ GÌ → THOÁT
    if (empty($data)) {
        return response()->json([
            'message' => 'Không có thông tin nào thay đổi'
        ], 200);
    }

    DB::beginTransaction();

    try {
        // 1️⃣ LẤY ĐỊA CHỈ HIỆN TẠI (LẤY 1 CÁI)
        $address = Address::where('user_id', $userId)->first();

        if ($address) {
            // 🔄 CÓ RỒI → UPDATE
            $address->fill($data);

            // ❌ DATA GIỐNG HỆT → KHÔNG LÀM GÌ
            if (!$address->isDirty()) {
                DB::rollBack();
                return response()->json([
                    'message' => 'Thông tin địa chỉ không thay đổi'
                ], 200);
            }

            $address->save();
        } else {
            // ➕ CHƯA CÓ → TẠO MỚI
            $address = Address::create(array_merge(
                ['user_id' => $userId],
                $data
            ));
        }

        // 2️⃣ TẠO THÔNG BÁO (CHỈ KHI CÓ THAY ĐỔI)
        $this->createUserNotification($userId);

        DB::commit();

        return response()->json([
            'message' => 'Cập nhật địa chỉ thành công',
            'data'    => $address
        ], 200);

    } catch (\Exception $e) {
        DB::rollBack();

        return response()->json([
            'message' => 'Cập nhật địa chỉ thất bại',
            'error'   => $e->getMessage()
        ], 500);
    }
}



private function createUserNotification($userId)
{
    $last = UserNotification::orderBy('id', 'desc')->first();
    $newId = $last ? $last->id + 1 : 1;

    UserNotification::create([
        'id'         => $newId,
        'user_id'    => $userId,
        'type'       => 'system',
      'title'       => 'Thông tin tài khoản ' . $userId . ' đã được cập nhật',
        'content'     => 'Thông tin tài khoản người dùng ' . $userId . ' đã được cập nhật.',
        'is_read'    => false,
        'created_at'=> now(),
        'updated_at'=> now(),
    ]);
}
}