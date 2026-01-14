import { useState } from "react";
import { Helmet } from "react-helmet";
import { useNavigate } from "react-router-dom";
import { AxiosError } from "axios";
import authApi, { type RegisterPayload } from "../../api/auth.api";
import { getRedirectPath } from "../../utils/redirect";

const Register = () => {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});
    setLoading(true);

    try {
      const payload: RegisterPayload = {
        username,
        password,
        password_confirmation: passwordConfirmation,
        full_name: fullName,
        role_id: "C"
      };

      const res = await authApi.register(payload);

      if (res.data.success) {
        const { access_token, role_id } = res.data.data;

        // 1. Lưu token
        localStorage.setItem("access_token", access_token);

        // 2. Redirect theo role
        const redirectTo = getRedirectPath("afterRegister", role_id);
        navigate(redirectTo);
      } else {
        setError(res.data.message || "Đăng ký thất bại");
      }
    } catch (err) {
      const error = err as AxiosError<{ 
        message?: string; 
        errors?: Record<string, string[]> 
      }>;

      if (error.response?.status === 422 && error.response.data.errors) {
        // Chuyển đổi lỗi field từ backend
        const errors: Record<string, string> = {};
        Object.entries(error.response.data.errors).forEach(([key, messages]) => {
          // Chuyển đổi key từ snake_case sang camelCase nếu cần
          const fieldKey = key === 'password_confirmation' ? 'passwordConfirmation' : key;
          errors[fieldKey] = messages[0]; // Lấy message đầu tiên
        });
        setFieldErrors(errors);
        setError(error.response.data.message || "Dữ liệu không hợp lệ");
      } else {
        setError(
          error.response?.data?.message ||
          "Không thể kết nối máy chủ. Vui lòng thử lại sau."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const clearFieldError = (fieldName: string) => {
    setFieldErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[fieldName];
      return newErrors;
    });
  };

  return (
    <>
      <Helmet>
        <title>Đăng ký tài khoản</title>
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
          <i className="bi bi-person-plus"></i>
          Đăng ký tài khoản
        </h3>
      </div>

      <form onSubmit={handleRegister}>
        {/* ERROR */}
        {error && (
          <div className="alert alert-danger text-center mb-3">
            {error}
          </div>
        )}

        <div className="row g-3">
          {/* Cột trái */}
          <div className="col-md-6">
            <div className="mb-3">
              <input
                type="text"
                className={`form-control ${fieldErrors.full_name ? 'is-invalid' : ''}`}
                placeholder="Nhập họ và tên"
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value);
                  clearFieldError('full_name');
                }}
                required
                maxLength={50}
              />
              {fieldErrors.full_name && (
                <div className="invalid-feedback">
                  {fieldErrors.full_name}
                </div>
              )}
              <small className="form-text text-muted">
                Tối đa 50 ký tự
              </small>
            </div>

            <div className="mb-3">
              <input
                type="text"
                className={`form-control ${fieldErrors.username ? 'is-invalid' : ''}`}
                placeholder="Nhập username (8-16 ký tự)"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  clearFieldError('username');
                }}
                required
                minLength={8}
                maxLength={16}
              />
              {fieldErrors.username && (
                <div className="invalid-feedback">
                  {fieldErrors.username}
                </div>
              )}
              <small className="form-text text-muted">
                Username phải từ 8-16 ký tự
              </small>
            </div>
          </div>

          {/* Cột phải */}
          <div className="col-md-6">
            <div className="mb-3">
              <input
                type="password"
                className={`form-control ${fieldErrors.password ? 'is-invalid' : ''}`}
                placeholder="Nhập mật khẩu (6-12 ký tự)"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  clearFieldError('password');
                }}
                required
                minLength={6}
                maxLength={12}
              />
              {fieldErrors.password && (
                <div className="invalid-feedback">
                  {fieldErrors.password}
                </div>
              )}
              <small className="form-text text-muted">
                Mật khẩu phải từ 6-12 ký tự
              </small>
            </div>

            <div className="mb-3">
              <input
                type="password"
                className={`form-control ${fieldErrors.passwordConfirmation || fieldErrors.password_confirmation ? 'is-invalid' : ''}`}
                placeholder="Nhập lại mật khẩu"
                value={passwordConfirmation}
                onChange={(e) => {
                  setPasswordConfirmation(e.target.value);
                  clearFieldError('passwordConfirmation');
                  clearFieldError('password_confirmation');
                }}
                required
                minLength={6}
                maxLength={12}
              />
              {(fieldErrors.passwordConfirmation || fieldErrors.password_confirmation) && (
                <div className="invalid-feedback">
                  {fieldErrors.passwordConfirmation || fieldErrors.password_confirmation}
                </div>
              )}
            </div>
          </div>
        </div>

        <button
          className="btn btn-success w-50 mt-3 text-center d-block mx-auto"
          disabled={loading}
        >
          {loading ? "Đang xử lý..." : "Đăng ký"}
        </button>
      </form>

      <div className="text-center mt-3">
        <small>
          Đã có tài khoản? <a href="/dang-nhap">Đăng nhập</a>
        </small>
      </div>
    </>
  );
};

export default Register;