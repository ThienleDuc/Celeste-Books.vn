import { useState, useRef, useEffect } from "react";
import { Helmet } from "react-helmet";
import { useNavigate } from "react-router-dom";
import { AxiosError } from "axios";
import authApi, { type RegisterPayload } from "../../api/auth.api";
import { getRedirectPath } from "../../utils/redirect";

const OTP_DURATION = 60; // 60 giây

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    email: "",
    password: "",
    passwordConfirmation: "",
    otp: "",
  });
  
  const [loading, setLoading] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [countdown, setCountdown] = useState(0);

  const otpInputRef = useRef<HTMLInputElement>(null);
  const countdownRef = useRef<number | null>(null);

  // Đếm ngược tự động
  useEffect(() => {
    // Xóa interval cũ trước khi tạo mới
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }

    if (countdown > 0) {
      countdownRef.current = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
        countdownRef.current = null;
      }
    };
  }, [countdown]);

  // Xử lý khi countdown về 0
  useEffect(() => {
    if (countdown === 0 && countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
  }, [countdown]);

  // Focus OTP input khi đã gửi OTP
  useEffect(() => {
    if (otpSent && otpInputRef.current) {
      otpInputRef.current.focus();
    }
  }, [otpSent]);

  const handleSendOtp = async () => {
    if (!formData.email) {
      setError("Vui lòng nhập email trước khi gửi mã xác nhận");
      return;
    }

    // Reset state
    setSendingOtp(true);
    setError(null);
    
    // Không reset otpSent ở đây, chỉ reset khi email thay đổi
    setFieldErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors.email;
      delete newErrors.otp;
      return newErrors;
    });

    // Dừng đếm ngược cũ nếu có
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }

    try {
      const res = await authApi.sendOtp({ email: formData.email });

      if (res.data.success) {
        // Bắt đầu đếm ngược
        setCountdown(OTP_DURATION);
        setOtpSent(true);
        setError(null);
        
        // Focus vào OTP input
        setTimeout(() => {
          if (otpInputRef.current) {
            otpInputRef.current.focus();
          }
        }, 100);
        
      } else {
        setError(res.data.message || "Gửi mã thất bại");
      }
    } catch (err) {
      const error = err as AxiosError<{ message?: string; errors?: Record<string, string[]> }>;
      
      if (error.response?.status === 422 && error.response.data.errors) {
        const errors: Record<string, string> = {};
        Object.entries(error.response.data.errors).forEach(([key, messages]) => {
          if (key === 'email') {
            errors[key] = messages[0];
          }
        });
        setFieldErrors(prev => ({ ...prev, ...errors }));
        setError("Vui lòng kiểm tra lại thông tin email");
      } else {
        setError(
          error.response?.data?.message ||
          "Không thể gửi mã xác nhận. Vui lòng thử lại sau."
        );
      }
    } finally {
      setSendingOtp(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});
    setLoading(true);

    // Kiểm tra OTP đã hết hạn chưa
    if (otpSent && countdown === 0) {
      setFieldErrors(prev => ({
        ...prev,
        otp: "Mã xác nhận đã hết hiệu lực. Gửi lại"
      }));
      setLoading(false);
      if (otpInputRef.current) {
        otpInputRef.current.focus();
      }
      return;
    }

    if (formData.otp.length !== 6) {
      setFieldErrors(prev => ({
        ...prev,
        otp: "Mã OTP phải có đúng 6 chữ số"
      }));
      setLoading(false);
      if (otpInputRef.current) {
        otpInputRef.current.focus();
      }
      return;
    }

    try {
      const payload: RegisterPayload = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        password_confirmation: formData.passwordConfirmation,
        full_name: formData.fullName,
        otp: formData.otp,
        role_id: "C"
      };

      const res = await authApi.register(payload);

      if (res.data.success) {
        const { access_token, role_id } = res.data.data!;
        localStorage.setItem("access_token", access_token);
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
        const errors: Record<string, string> = {};
        
        Object.entries(error.response.data.errors).forEach(([key, messages]) => {
          if (key === 'role_id') return;
          
          let fieldKey = key;
          
          if (key === 'full_name') {
            fieldKey = 'fullName';
          } else if (key === 'password_confirmation') {
            fieldKey = 'passwordConfirmation';
          }
          
          if (messages && messages.length > 0) {
            errors[fieldKey] = messages[0];
          }
        });
        
        if (error.response.data.message && error.response.data.message.includes('OTP')) {
          errors['otp'] = error.response.data.message;
        }
        
        setFieldErrors(errors);
        
        if (Object.keys(errors).length > 0) {
          setError("Vui lòng kiểm tra lại thông tin đã nhập");
        } else if (error.response.data.message && !error.response.data.message.includes('OTP')) {
          setError(error.response.data.message);
        }
        
        if (errors.otp && otpInputRef.current) {
          otpInputRef.current.focus();
        }
      } else {
        const errorMessage = error.response?.data?.message || 
                            "Không thể kết nối máy chủ. Vui lòng thử lại sau.";
        setError(errorMessage);
        
        if (errorMessage.includes('OTP') && otpInputRef.current) {
          setFieldErrors(prev => ({
            ...prev,
            otp: errorMessage
          }));
          otpInputRef.current.focus();
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Xóa lỗi của trường khi người dùng bắt đầu nhập lại
    if (fieldErrors[field]) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
    
    // Reset OTP state nếu người dùng thay đổi email
    if (field === 'email' && otpSent) {
      setOtpSent(false);
      setCountdown(0);
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
        countdownRef.current = null;
      }
    }
    
    // Xóa lỗi OTP khi người dùng bắt đầu nhập
    if (field === 'otp' && fieldErrors.otp) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.otp;
        return newErrors;
      });
    }
  };

  // Định dạng thời gian đếm ngược (MM:SS)
  const formatCountdown = () => {
    const minutes = Math.floor(countdown / 60);
    const seconds = countdown % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getFieldError = (fieldName: string): string | undefined => {
    return fieldErrors[fieldName];
  };

  // Render nút OTP với các trạng thái khác nhau
  const renderOtpButton = () => {
    if (sendingOtp) {
      return (
        <>
          <span className="spinner-border spinner-border-sm me-1" role="status"></span>
          <span>Đang gửi</span>
        </>
      );
    }
    
    if (countdown > 0) {
      return (
        <>
          <i className="bi bi-clock me-1"></i>
          <span>{formatCountdown()}</span>
        </>
      );
    }
    
    // Khi đã gửi OTP nhưng hết thời gian
    if (otpSent && countdown === 0) {
      return (
        <>
          <i className="bi bi-arrow-clockwise me-1"></i>
          <span>Gửi lại</span>
        </>
      );
    }
    
    // Trạng thái ban đầu - chưa gửi OTP
    return (
      <>
        <i className="bi bi-send me-1"></i>
        <span>Gửi mã</span>
      </>
    );
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
        {error && !Object.keys(fieldErrors).length && (
          <div className="alert alert-danger text-center mb-3">
            {error}
          </div>
        )}

        <div className="row g-3">
          <div className="col-md-6">
            <div className="mb-3">
              <label className="form-label fw-semibold">
                Username <span className="text-danger">*</span>
                <small className="text-muted ms-1">(8-16 ký tự)</small>
              </label>
              <input
                type="text"
                className={`form-control ${getFieldError('username') ? 'is-invalid' : ''}`}
                placeholder="Nhập username"
                value={formData.username}
                onChange={(e) => handleChange('username', e.target.value)}
                required
                minLength={8}
                maxLength={16}
              />
              {getFieldError('username') && (
                <div className="invalid-feedback d-block">
                  {getFieldError('username')}
                </div>
              )}
            </div>
          </div>

          <div className="col-md-6">
            <div className="mb-3">
              <label className="form-label fw-semibold">
                Họ và tên <span className="text-danger">*</span>
                <small className="text-muted ms-1">(Tối đa 50 ký tự)</small>
              </label>
              <input
                type="text"
                className={`form-control ${getFieldError('fullName') ? 'is-invalid' : ''}`}
                placeholder="Nhập họ và tên đầy đủ"
                value={formData.fullName}
                onChange={(e) => handleChange('fullName', e.target.value)}
                required
                maxLength={50}
              />
              {getFieldError('fullName') && (
                <div className="invalid-feedback d-block">
                  {getFieldError('fullName')}
                </div>
              )}
            </div>
          </div>

          <div className="col-12">
            <div className="mb-3">
              <label className="form-label fw-semibold">
                Email <span className="text-danger">*</span>
              </label>
              <input
                type="email"
                className={`form-control ${getFieldError('email') ? 'is-invalid' : ''}`}
                placeholder="Nhập email của bạn"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                required
                maxLength={255}
                disabled={otpSent && countdown > 0 && !getFieldError('email')}
              />
              {getFieldError('email') && (
                <div className="invalid-feedback d-block">
                  {getFieldError('email')}
                </div>
              )}
            </div>
          </div>

          <div className="col-md-6">
            <div className="mb-3">
              <label className="form-label fw-semibold">
                Mật khẩu <span className="text-danger">*</span>
                <small className="text-muted ms-1">(6-12 ký tự)</small>
              </label>
              <input
                type="password"
                className={`form-control ${getFieldError('password') ? 'is-invalid' : ''}`}
                placeholder="Nhập mật khẩu"
                value={formData.password}
                onChange={(e) => handleChange('password', e.target.value)}
                required
                minLength={6}
                maxLength={12}
              />
              {getFieldError('password') && (
                <div className="invalid-feedback d-block">
                  {getFieldError('password')}
                </div>
              )}
            </div>
          </div>

          <div className="col-md-6">
            <div className="mb-3">
              <label className="form-label fw-semibold">
                Xác nhận mật khẩu <span className="text-danger">*</span>
              </label>
              <input
                type="password"
                className={`form-control ${getFieldError('passwordConfirmation') ? 'is-invalid' : ''}`}
                placeholder="Nhập lại mật khẩu"
                value={formData.passwordConfirmation}
                onChange={(e) => handleChange('passwordConfirmation', e.target.value)}
                required
                minLength={6}
                maxLength={12}
              />
              {getFieldError('passwordConfirmation') && (
                <div className="invalid-feedback d-block">
                  {getFieldError('passwordConfirmation')}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* OTP Section */}
        <div className="mt-4">
          <div className="row g-3 align-items-end">
            <div className="col-md-8">
              <div className="mb-0">
                <label className="form-label fw-semibold mb-1">
                  Mã xác nhận <span className="text-danger">*</span>
                  <small className="text-muted ms-1">(6 chữ số)</small>
                </label>
                <input
                  ref={otpInputRef}
                  type="text"
                  className={`form-control ${getFieldError('otp') ? 'is-invalid' : ''}`}
                  placeholder="Nhập mã xác nhận từ email"
                  value={formData.otp}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                    handleChange('otp', value);
                  }}
                  maxLength={6}
                  disabled={!formData.email}
                  required
                />
              </div>
            </div>
            
            <div className="col-md-4">
              <div className="mb-0">
                <label className="form-label fw-semibold mb-1 invisible">Gửi mã</label>
                <button
                  type="button"
                  className={`btn w-100 ${countdown > 0 ? 'btn-secondary disabled' : 'btn-outline-primary'}`}
                  onClick={handleSendOtp}
                  disabled={sendingOtp || !formData.email || countdown > 0}
                >
                  {renderOtpButton()}
                </button>
              </div>
            </div>

            {/* Thông báo lỗi OTP */}
            {getFieldError('otp') ? (
              <div className={`${countdown === 0 ? 'text-danger' : 'invalid-feedback'} d-block mt-1`}>
                <i className="bi bi-exclamation-triangle me-1"></i>
                {getFieldError('otp')}
              </div>
            ) : (
              // Thông báo OTP đã được gửi
              otpSent && countdown > 0 && (
                <small className="form-text text-muted mt-1 d-block">
                  <i className="bi bi-check-circle me-1"></i>
                  Mã OTP đã được gửi đến {formData.email}
                </small>
              )
            )}
          </div>
        </div>

        <button
          className="btn btn-success w-50 mt-4 text-center d-block mx-auto"
          disabled={loading || (otpSent && !formData.otp) || (otpSent && countdown === 0)}
          type="submit"
        >
          {loading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status"></span>
              Đang xử lý...
            </>
          ) : "Đăng ký"}
        </button>

        <div className="text-center mt-4">
          <small className="text-muted">
            Đã có tài khoản? <a href="/dang-nhap" className="text-decoration-none">Đăng nhập</a>
          </small>
          <div className="mt-1">
            <small className="text-muted">
              Bạn là nhân viên? <a href="/nhan-vien/dang-ky" className="text-decoration-none">Đăng ký tại đây</a>
            </small>
          </div>
        </div>
      </form>
    </>
  );
};

export default Register;