<?php

namespace App\Http\Controllers;

use App\Models\Address;
use App\Models\UserNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AddressController extends Controller
{
    public function update(Request $request, $id)
    {
        $request->validate([
            'label'           => 'nullable|string|max:50',
            'receiver_name'   => 'required|string|max:255',
            'phone'           => 'required|string|max:20',
            'street_address'  => 'required|string|max:255',
            'commune_id'      => 'required|integer',
            'is_default'      => 'nullable|boolean'
        ]);

        $address = Address::find($id);
        if (!$address) {
            return response()->json([
                'message' => 'Address not found'
            ], 404);
        }

        DB::beginTransaction();
        try {

            // 1️⃣ Fill dữ liệu mới
            $address->fill([
                'label'           => $request->label,
                'receiver_name'   => $request->receiver_name,
                'phone'           => $request->phone,
                'street_address'  => $request->street_address,
                'commune_id'      => $request->commune_id,
                'is_default'      => $request->has('is_default')
                    ? $request->boolean('is_default')
                    : $address->is_default,
            ]);

            // 2️⃣ Không có thay đổi → thoát
            if (!$address->isDirty()) {
                DB::rollBack();
                return response()->json([
                    'message' => 'Không có thông tin địa chỉ nào thay đổi'
                ], 200);
            }

            // 3️⃣ Nếu set mặc định → bỏ mặc định address khác
            if ($address->is_default) {
                Address::where('user_id', $address->user_id)
                    ->where('id', '!=', $address->id)
                    ->update(['is_default' => 0]);
            }

            // 4️⃣ Save địa chỉ
            $address->save();

            // 5️⃣ Tạo notification (CHỈ KHI CÓ THAY ĐỔI)
            $this->createUserNotification($address->user_id);

            DB::commit();

            return response()->json([
                'message' => 'Cập nhật địa chỉ thành công',
                'data' => $address
            ]);

        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'message' => 'Cập nhật địa chỉ thất bại',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * ✅ Tạo thông báo cho user
     * (DB auto increment ID)
     */
    private function createUserNotification($userId)
    {
        UserNotification::create([
            'user_id' => $userId,
            'type'    => 'system',
            'title'   => 'Địa chỉ giao hàng đã được cập nhật',
            'content' => 'Địa chỉ giao hàng của bạn đã được cập nhật. Nếu không phải do bạn thực hiện, vui lòng liên hệ quản trị viên.',
            'is_read' => false,
        ]);
    }
}
