import { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import { useNavigate } from "react-router-dom";
import { AxiosError } from "axios";
import authApi from "../../api/auth.api";
import rolesApi from "../../api/roles.api";
import type { Role } from "../../api/roles.api";
import { getRedirectPath } from "../../utils/redirect";

const EmployeeLogin = () => {
    const navigate = useNavigate();

    const [login, setLogin] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [roles, setRoles] = useState<Role[]>([]);
    const [loadingRoles, setLoadingRoles] = useState(true);
    const [employeeRoleIds, setEmployeeRoleIds] = useState<string[]>([]);

    // Load danh sách vai trò
    useEffect(() => {
        const loadRoles = async () => {
            try {
                setLoadingRoles(true);
                const res = await rolesApi.getAll();
                
                if (res.data.success) {
                    // Lọc bỏ vai trò Customer (role_id = "C")
                    const filteredRoles = res.data.data.filter(role => role.id !== "C");
                    setRoles(filteredRoles);
                    
                    // Lấy danh sách role_id của nhân viên
                    const roleIds = filteredRoles.map(role => role.id);
                    setEmployeeRoleIds(roleIds);
                }
            } catch (err) {
                console.error("Lỗi khi load danh sách vai trò:", err);
                setError("Không thể tải danh sách vai trò. Vui lòng thử lại sau.");
            } finally {
                setLoadingRoles(false);
            }
        };
        
        loadRoles();
    }, []);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            // Login bằng username hoặc email
            const payload =
                login.includes("@")
                ? { email: login, password }
                : { username: login, password };

            const res = await authApi.login(payload);

            if (res.data.success) {
                // Kiểm tra data có tồn tại không
                if (!res.data.data) {
                    setError("Đăng nhập thất bại: không nhận được dữ liệu từ server");
                    return;
                }

                const {
                    access_token,
                    role_id,
                } = res.data.data;

                // Kiểm tra role nhân viên (tất cả role trừ Customer)
                if (!employeeRoleIds.includes(role_id)) {
                    setError("Tài khoản này không có quyền truy cập trang nhân viên");
                    // Xóa token nếu không phải nhân viên
                    localStorage.removeItem("access_token");
                    return;
                }

                // 1. Lưu token
                localStorage.setItem("access_token", access_token);

                // 2. Redirect theo role
                const redirectTo = getRedirectPath("afterLogin", role_id);
                navigate(redirectTo);
            } else {
                setError(res.data.message || "Đăng nhập thất bại");
            }
        } catch (err) {
            const error = err as AxiosError<{ message?: string }>;

            setError(
                error.response?.data?.message ||
                "Không thể kết nối máy chủ"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Helmet>
                <title>Đăng nhập nhân viên</title>
            </Helmet>

            <div className="auth-title-container position-relative text-center mb-4">
                <a
                href="/"
                className="home-btn position-absolute start-0 top-50 translate-middle-y"
                title="Trang chủ"
                >
                <i className="bi bi-house-door-fill"></i>
                </a>

                <h3 className="fw-bold auth-title d-inline-flex align-items-center gap-2 mb-0">
                    <i className="bi bi-box-arrow-in-right"></i>
                    Đăng nhập nhân viên
                </h3>
            </div>

            {loadingRoles ? (
                <div className="text-center mb-3">
                    <div className="spinner-border spinner-border-sm me-2"></div>
                    <span>Đang tải danh sách vai trò...</span>
                </div>
            ) : (
                <form onSubmit={handleLogin}>
                    {/* ERROR */}
                    {error && (
                    <div className="alert alert-danger text-center mb-3">
                        {error}
                    </div>
                    )}
                    
                    <div className="mb-3">
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Nhập username / email"
                            value={login}
                            onChange={(e) => setLogin(e.target.value)}
                            required
                        />
                    </div>

                    <div className="mb-3">
                        <input
                            type="password"
                            className="form-control"
                            placeholder="Nhập mật khẩu"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <div className="form-check">
                            <input
                            className="form-check-input"
                            type="checkbox"
                            id="rememberMe"
                            />
                            <label className="form-check-label" htmlFor="rememberMe">
                            Nhớ mật khẩu
                            </label>
                        </div>

                        <a href="/quen-mat-khau" className="text-decoration-none">
                            Quên mật khẩu?
                        </a>
                    </div>

                    <button
                        className="btn btn-success w-100 mb-3"
                        disabled={loading || loadingRoles}
                        type="submit"
                    >
                        {loading ? "Đang đăng nhập..." : "Đăng nhập"}
                    </button>

                    <div className="text-center mb-3">
                        <small className="text-muted">
                            * Chỉ dành cho: {roles.map(role => role.name).join(", ")}
                        </small>
                    </div>
                </form>
            )}
        </>
    );
};

export default EmployeeLogin;