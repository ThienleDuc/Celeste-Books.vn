<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Laravel\Sanctum\PersonalAccessToken;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\Log;

class AuthenticateWithSanctum
{
    /**
     * Xác thực request dựa trên token Bearer của Sanctum
     */
    public function handle(Request $request, Closure $next): Response
    {
        // 1. Lấy token từ header Authorization
        $bearerToken = $request->bearerToken(); // định dạng: id|plain_token

        if (!$bearerToken) {
            return response()->json([
                'success' => false,
                'message' => 'Token không tồn tại',
                'error_code' => 'TOKEN_MISSING'
            ], 401);
        }

        // 2. Token phải có định dạng id|plain_token
        if (strpos($bearerToken, '|') === false) {
            return response()->json([
                'success' => false,
                'message' => 'Token không đúng định dạng',
                'error_code' => 'TOKEN_INVALID_FORMAT',
                'token_received' => $bearerToken
            ], 401);
        }

        // 3. Tách ID và plain token
        [$id, $plainToken] = explode('|', $bearerToken, 2);

        // Debug log
        Log::debug('Sanctum token received', [
            'raw_token' => $bearerToken,
            'id' => $id,
            'plain_token_length' => strlen($plainToken)
        ]);

        // 4. Lấy token từ DB theo ID
        $tokenModel = PersonalAccessToken::find($id);

        if (!$tokenModel) {
            Log::warning('Sanctum token ID not found', ['id' => $id]);
            return response()->json([
                'success' => false,
                'message' => 'Token không hợp lệ hoặc đã bị xóa',
                'error_code' => 'TOKEN_NOT_FOUND',
                'token_received' => $bearerToken
            ], 401);
        }

        // 5. So sánh hash của plain token
        if (!hash_equals($tokenModel->token, hash('sha256', $plainToken))) {
            Log::warning('Sanctum token hash mismatch', [
                'id' => $id,
                'plain_token' => $plainToken
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Token không hợp lệ',
                'error_code' => 'TOKEN_INVALID_HASH',
                'token_received' => $bearerToken
            ], 401);
        }

        // 6. Kiểm tra token hết hạn
        if ($tokenModel->expires_at && now()->greaterThan($tokenModel->expires_at)) {
            $tokenModel->delete(); // xóa token hết hạn
            return response()->json([
                'success' => false,
                'message' => 'Token đã hết hạn',
                'error_code' => 'TOKEN_EXPIRED',
                'token_received' => $bearerToken
            ], 401);
        }

        // 7. Lấy user liên kết token
        $user = $tokenModel->tokenable;

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Người dùng không tồn tại',
                'error_code' => 'USER_NOT_FOUND',
                'token_received' => $bearerToken
            ], 401);
        }

        // 8. Kiểm tra trạng thái tài khoản
        if (property_exists($user, 'is_active') && !$user->is_active) {
            return response()->json([
                'success' => false,
                'message' => 'Tài khoản đã bị vô hiệu hóa',
                'error_code' => 'ACCOUNT_DISABLED'
            ], 403);
        }

        // 9. Gắn user & token vào request để controller dùng
        $request->attributes->set('authenticated_user', $user);
        $request->attributes->set('access_token_model', $tokenModel);

        // 10. Gắn user vào auth guard để $request->user() hoạt động
        auth()->setUser($user);

        return $next($request);
    }
}
