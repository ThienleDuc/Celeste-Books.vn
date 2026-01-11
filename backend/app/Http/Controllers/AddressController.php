<?php

namespace App\Http\Controllers;

use App\Models\Address;
use App\Models\UserNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class AddressController extends Controller
{
    // 1. Thêm method index() để lấy danh sách
    public function index(Request $request)
    {
        try {
            $query = Address::query();
            
            // Lọc theo user_id nếu có
            if ($request->has('user_id')) {
                $query->where('user_id', $request->user_id);
            }
            
            // Lọc theo is_default
            if ($request->has('is_default')) {
                $query->where('is_default', $request->is_default);
            }
            
            // Phân trang
            $perPage = $request->get('per_page', 20);
            $addresses = $query->paginate($perPage);
            
            return response()->json([
                'success' => true,
                'message' => 'Lấy danh sách địa chỉ thành công',
                'data' => $addresses
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi server',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    

    // 2. Thêm method getByUser()
    public function getByUser($userId)
    {
        try {
            $addresses = Address::where('user_id', $userId)->get();
            
            return response()->json([
                'success' => true,
                'message' => 'Lấy địa chỉ theo user thành công',
                'data' => $addresses
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi server',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    // 3. Thêm method store() (nếu cần)
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'user_id' => 'required|exists:users,id',
            'label' => 'nullable|string|max:50',
            'receiver_name' => 'required|string|max:255',
            'phone' => 'required|string|max:20',
            'street_address' => 'required|string|max:255',
            'commune_id' => 'required|exists:communes,id',
            'is_default' => 'nullable|boolean',
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Dữ liệu không hợp lệ',
                'errors' => $validator->errors()
            ], 422);
        }
        
        DB::beginTransaction();
        try {
            $address = Address::create($request->all());
            
            DB::commit();
            
            return response()->json([
                'success' => true,
                'message' => 'Thêm địa chỉ thành công',
                'data' => $address
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Thêm địa chỉ thất bại',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    // 4. Thêm method show()
    public function show($id)
    {
        try {
            $address = Address::find($id);
            
            if (!$address) {
                return response()->json([
                    'success' => false,
                    'message' => 'Không tìm thấy địa chỉ'
                ], 404);
            }
            
            return response()->json([
                'success' => true,
                'message' => 'Lấy chi tiết địa chỉ thành công',
                'data' => $address
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi server',
                'error' => $e->getMessage()
            ], 500);
        }
    }

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
            // LẤY ĐỊA CHỈ HIỆN TẠI (LẤY 1 CÁI)
            $address = Address::where('user_id', $userId)->first();

            if ($address) {
                // CÓ RỒI → UPDATE
                $address->fill($data);

                // DATA GIỐNG HỆT → KHÔNG LÀM GÌ
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

            // TẠO THÔNG BÁO (CHỈ KHI CÓ THAY ĐỔI)
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

    // Thêm method này vào AddressController
    public function updateById(Request $request, $id)
    {
        // Validate
        $validator = Validator::make($request->all(), [
            'label'          => 'nullable|string|max:50',
            'receiver_name'  => 'nullable|string|max:255',
            'phone'          => 'nullable|string|max:20',
            'street_address' => 'nullable|string|max:255',
            'commune_id'     => 'nullable|exists:communes,id',
            'is_default'     => 'nullable|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Dữ liệu không hợp lệ',
                'errors' => $validator->errors()
            ], 422);
        }

        $address = Address::find($id);
        
        if (!$address) {
            return response()->json([
                'success' => false,
                'message' => 'Không tìm thấy địa chỉ'
            ], 404);
        }

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

        if (empty($data)) {
            return response()->json([
                'success' => true,
                'message' => 'Không có thông tin nào thay đổi'
            ], 200);
        }

        DB::beginTransaction();
        try {
            // Nếu đánh dấu là mặc định, hủy tất cả mặc định cũ của user
            if (isset($data['is_default']) && $data['is_default']) {
                Address::where('user_id', $address->user_id)
                    ->where('id', '!=', $id)
                    ->where('is_default', true)
                    ->update(['is_default' => false]);
            }

            $address->fill($data);
            
            if (!$address->isDirty()) {
                DB::rollBack();
                return response()->json([
                    'success' => true,
                    'message' => 'Thông tin địa chỉ không thay đổi'
                ], 200);
            }

            $address->save();
            
            // Tạo thông báo
            $this->createUserNotification($address->user_id);
            
            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Cập nhật địa chỉ thành công',
                'data'    => $address
            ], 200);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Cập nhật địa chỉ thất bại',
                'error'   => $e->getMessage()
            ], 500);
        }
    }

     public function setDefaultAddress($id)
    {
        DB::beginTransaction();
        try {
            $address = Address::find($id);
            
            if (!$address) {
                return response()->json([
                    'success' => false,
                    'message' => 'Không tìm thấy địa chỉ'
                ], 404);
            }
            
            // Hủy tất cả địa chỉ mặc định cũ của user
            Address::where('user_id', $address->user_id)
                ->where('is_default', true)
                ->update(['is_default' => false]);
            
            // Set địa chỉ này thành mặc định
            $address->is_default = true;
            $address->save();
            
            DB::commit();
            
            return response()->json([
                'success' => true,
                'message' => 'Đã đặt làm địa chỉ mặc định',
                'data' => $address
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Cập nhật thất bại',
                'error' => $e->getMessage()
            ], 500);
        }
    }

     public function getDefaultAddress($userId)
    {
        try {
            $address = Address::where('user_id', $userId)
                ->where('is_default', true)
                ->first();
            
            return response()->json([
                'success' => true,
                'message' => $address ? 'Lấy địa chỉ mặc định thành công' : 'Không có địa chỉ mặc định',
                'data' => $address
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi server',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function validateForCheckout($addressId)
    {
        try {
            $address = Address::with('commune.province')->find($addressId);
            
            if (!$address) {
                return response()->json([
                    'valid' => false,
                    'message' => 'Địa chỉ không tồn tại'
                ]);
            }
            
            // Kiểm tra các điều kiện cho phép giao hàng
            $valid = true;
            $messages = [];
            
            if (empty($address->street_address)) {
                $valid = false;
                $messages[] = 'Thiếu số nhà/tên đường';
            }
            
            if (empty($address->receiver_name)) {
                $valid = false;
                $messages[] = 'Thiếu tên người nhận';
            }
            
            if (empty($address->phone)) {
                $valid = false;
                $messages[] = 'Thiếu số điện thoại';
            }
            
            if (!$address->commune) {
                $valid = false;
                $messages[] = 'Địa chỉ không hợp lệ (thiếu xã/phường)';
            }
            
            return response()->json([
                'valid' => $valid,
                'message' => $valid ? 'Địa chỉ hợp lệ' : implode(', ', $messages),
                'data' => $address,
                'issues' => $messages
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'valid' => false,
                'message' => 'Lỗi kiểm tra địa chỉ'
            ], 500);
        }
    }

    public function quickCreateForCheckout(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'user_id' => 'required|exists:users,id',
            'receiver_name' => 'required|string|max:255',
            'phone' => 'required|string|max:20',
            'street_address' => 'required|string|max:255',
            'commune_id' => 'required|exists:communes,id',
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Dữ liệu không hợp lệ',
                'errors' => $validator->errors()
            ], 422);
        }
        
        DB::beginTransaction();
        try {
            // Tạo địa chỉ mới
            $address = Address::create([
                'user_id' => $request->user_id,
                'receiver_name' => $request->receiver_name,
                'phone' => $request->phone,
                'street_address' => $request->street_address,
                'commune_id' => $request->commune_id,
                'label' => $request->label ?? 'Nhà riêng',
                'is_default' => false, // Không set mặc định khi tạo nhanh
            ]);
            
            DB::commit();
            
            return response()->json([
                'success' => true,
                'message' => 'Tạo địa chỉ thành công',
                'data' => $address
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Tạo địa chỉ thất bại',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function verifyOwnership($addressId, $userId)
    {
        try {
            $exists = Address::where('id', $addressId)
                ->where('user_id', $userId)
                ->exists();
            
            return response()->json([
                'success' => true,
                'is_owner' => $exists,
                'message' => $exists ? 'Người dùng sở hữu địa chỉ này' : 'Người dùng không sở hữu địa chỉ này'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Lỗi kiểm tra quyền sở hữu'
            ], 500);
        }
    }

}