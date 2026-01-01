<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Address;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use App\Models\UserNotification;
class UserController extends Controller
{
    /* =========================
     *  XEM THÔNG TIN USER
     * ========================= */
    public function show($id)
    {
        $user = User::with(['profile', 'addresses', 'notifications'])->find($id);

        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        return response()->json(['data' => $user], 200);
    }

    /* =========================
     *  CẬP NHẬT THÔNG TIN CƠ BẢN
     * ========================= */
   public function updateBasicInfo(Request $request, $id)
{
    $request->validate([
        'email'     => 'nullable|email',
        'username'  => 'nullable|string|max:255',
        'full_name' => 'nullable|string|max:255',
        'phone'     => 'nullable|string|max:20',
        'birthday'  => 'nullable|date',
        'gender'    => 'nullable|in:male,female,other'
    ]);

    $user = User::find($id);
    if (!$user) {
        return response()->json(['message' => 'User not found'], 404);
    }

    DB::beginTransaction();
    try {
        $user->fill($request->only(['email', 'username']));
        $userChanged = $user->isDirty();

        $profile = $user->profile()->firstOrNew(['user_id' => $user->id]);
        $profile->fill($request->only(['full_name', 'phone', 'birthday', 'gender']));
        $profileChanged = $profile->isDirty();

        // ❌ Không có gì thay đổi
        if (!$userChanged && !$profileChanged) {
            DB::rollBack();
            return response()->json([
                'message' => 'Không có thông tin nào thay đổi'
            ], 200);
        }

        // ✅ Có thay đổi → save
        if ($userChanged) $user->save();
        if ($profileChanged) $profile->save();

        DB::commit();

        // ✅ CHỈ tạo thông báo khi có thay đổi
        $this->createUserNotification($user->id);

        return response()->json([
            'message' => 'Cập nhật thông tin thành công',
            'data' => $user->load('profile')
        ]);

    } catch (\Exception $e) {
        DB::rollBack();
        return response()->json([
            'message' => 'Cập nhật thất bại',
            'error' => $e->getMessage()
        ], 500);
    }
}


    /* =========================
     *  ĐỔI ẢNH ĐẠI DIỆN
     * ========================= */
  public function uploadAvatar(Request $request, $id)
{
    $request->validate([
        'avatar' => 'required|image|mimes:jpg,jpeg,png|max:2048'
    ]);

    $user = User::find($id);
    if (!$user) {
        return response()->json(['message' => 'User not found'], 404);
    }

    // Lưu file
    $path = $request->file('avatar')->store('avatars', 'public');

    // Lưu DB
    $user->profile()->updateOrCreate(
        ['user_id' => $user->id],
        ['avatar_url' => $path]
    );

 $this->createUserNotification($user->id);

    return response()->json([
        'message' => 'Upload avatar thành công',
        'avatar_url' => asset('storage/' . $path)
    ], 200);
}


    /* =========================
     *  ĐỔI MẬT KHẨU
     * ========================= */
 public function changePassword(Request $request, $id)
{
    $request->validate([
        'current_password' => 'required',
        'new_password' => 'required|min:6|confirmed'
    ]);

    $user = User::find($id);
    if (!$user) {
        return response()->json(['message' => 'User not found'], 404);
    }

    // ✅ CHECK mật khẩu cũ (text vs hash)
    if (!Hash::check($request->current_password, $user->password_hash)) {
        return response()->json([
            'message' => 'Mật khẩu hiện tại không đúng'
        ], 400);
    }

    // ✅ HASH mật khẩu mới
    $user->password_hash = Hash::make($request->new_password);
    $user->save();
    $this->createUserNotification($user->id);
    return response()->json([
        'message' => 'Đổi mật khẩu thành công'
    ]);
}
// không dùng
public function updateByUser(Request $request, $userId)
{
    $request->validate([
        'label'           => 'nullable|string|max:50',
        'receiver_name'   => 'required|string|max:255',
        'phone'           => 'required|string|max:20',
        'street_address'  => 'required|string|max:255',
        'commune_id'      => 'required|integer'
    ]);

    // 🔍 LẤY ĐỊA CHỈ MẶC ĐỊNH CỦA USER
    $address = Address::where('user_id', $userId)
        ->where('is_default', 1)
        ->first();

    if (!$address) {
        return response()->json([
            'message' => 'User chưa có địa chỉ mặc định'
        ], 404);
    }

    $address->update([
        'label'           => $request->label,
        'receiver_name'   => $request->receiver_name,
        'phone'           => $request->phone,
        'street_address'  => $request->street_address,
        'commune_id'      => $request->commune_id,
    ]);
$this->createUserNotification($userId);
    return response()->json([
        'message' => 'Cập nhật địa chỉ thành công',
        'data' => $address
    ]);
}
//bỏ phần trên
private function createUserNotification($userId)
{
    $last = UserNotification::orderBy('id', 'desc')->first();
    $newId = $last ? $last->id + 1 : 1;

    UserNotification::create([
        'id'         => $newId,
        'user_id'    => $userId,
        'type'       => 'system',
        'title'      => 'Thông tin tài khoản đã được cập nhật',
        'content'    => 'Thông tin tài khoản của bạn đã được cập nhật. Nếu không phải do bạn thực hiện, vui lòng liên hệ quản trị viên.',
        'is_read'    => false,
        'created_at'=> now(),
        'updated_at'=> now(),
    ]);
}



  }
