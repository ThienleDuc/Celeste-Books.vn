<!-- resources/views/emails/otp.blade.php -->
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mã OTP của bạn</title>
    <style>
        /* CSS Styles */
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            line-height: 1.6;
            color: #333333;
            background-color: #f7f9fc;
            margin: 0;
            padding: 20px;
        }
        
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
        }
        
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px 30px;
            text-align: center;
        }
        
        .header h1 {
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 10px;
            letter-spacing: -0.5px;
        }
        
        .header p {
            font-size: 16px;
            opacity: 0.9;
            font-weight: 400;
        }
        
        .content {
            padding: 40px 30px;
        }
        
        .otp-display {
            background: linear-gradient(135deg, #f6f8ff 0%, #f0f2ff 100%);
            border-radius: 12px;
            padding: 30px;
            text-align: center;
            margin: 30px 0;
            border: 2px dashed #667eea;
        }
        
        .otp-code {
            font-family: 'Courier New', monospace;
            font-size: 42px;
            font-weight: 700;
            color: #667eea;
            letter-spacing: 8px;
            margin: 15px 0;
            padding: 10px;
            background: white;
            border-radius: 8px;
            display: inline-block;
        }
        
        .countdown-timer {
            background-color: #f0f7ff;
            border-radius: 12px;
            padding: 25px;
            text-align: center;
            margin: 30px 0;
            border: 2px solid #667eea;
        }
        
        #countdown-display {
            font-family: 'Courier New', monospace;
            font-size: 32px;
            font-weight: 700;
            color: #e53e3e;
            margin: 10px 0;
            padding: 15px;
            background: white;
            border-radius: 8px;
            display: inline-block;
            min-width: 180px;
        }
        
        .info-box {
            background-color: #f8f9fa;
            border-left: 4px solid #667eea;
            padding: 20px;
            border-radius: 8px;
            margin: 30px 0;
        }
        
        .progress-container {
            background-color: #e2e8f0;
            border-radius: 10px;
            height: 10px;
            margin: 25px 0;
            overflow: hidden;
        }
        
        #progress-bar {
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, #48bb78 0%, #e53e3e 100%);
            border-radius: 10px;
            transition: width 1s linear;
        }
        
        .warning-box {
            background-color: #fff5f5;
            border: 1px solid #fed7d7;
            border-radius: 8px;
            padding: 20px;
            margin: 30px 0;
        }
        
        .footer {
            background-color: #f8f9fa;
            padding: 25px 30px;
            text-align: center;
            border-top: 1px solid #eee;
        }
        
        /* Animations */
        @keyframes blink {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
        }
        
        .blink {
            animation: blink 1s infinite;
        }
        
        /* Responsive */
        @media only screen and (max-width: 600px) {
            body {
                padding: 10px !important;
            }
            
            .email-container {
                max-width: 100% !important;
            }
            
            .content {
                padding: 30px 20px !important;
            }
            
            .otp-code {
                font-size: 36px !important;
                letter-spacing: 6px !important;
            }
            
            #countdown-display {
                font-size: 28px !important;
                min-width: 160px !important;
            }
            
            .header {
                padding: 30px 20px !important;
            }
            
            .header h1 {
                font-size: 24px !important;
            }
        }
        
        /* No JavaScript message */
        .no-js-message {
            background-color: #feebc8;
            border: 1px solid #fbd38d;
            border-radius: 8px;
            padding: 15px;
            margin: 20px 0;
            text-align: center;
            color: #744210;
            font-size: 14px;
            display: none;
        }
    </style>
</head>
<body>
    <!-- Email Container -->
    <div class="email-container">
        <!-- Header -->
        <div class="header">
            <h1>Xác Thực Tài Khoản</h1>
            <p>Mã OTP đăng ký của bạn</p>
        </div>

        <!-- Content -->
        <div class="content">
            <!-- Greeting -->
            <p style="font-size: 16px; margin-bottom: 20px; color: #555;">
                Xin chào,
            </p>
            
            <p style="font-size: 16px; margin-bottom: 30px; color: #555;">
                Bạn đang thực hiện đăng ký tài khoản. Vui lòng sử dụng mã OTP bên dưới để hoàn tất xác thực:
            </p>

            <!-- OTP Display -->
            <div class="otp-display">
                <p style="font-size: 14px; color: #666; margin-bottom: 15px; font-weight: 500;">
                    MÃ XÁC THỰC CỦA BẠN
                </p>
                <div class="otp-code">
                    <?php echo e($otp); ?>

                </div>
                <p style="font-size: 13px; color: #888; margin-top: 10px;">
                    (Mã gồm 6 chữ số)
                </p>
            </div>

            <!-- Countdown Timer -->
            <div class="countdown-timer">
                <p style="font-size: 16px; color: #667eea; font-weight: 600; margin-bottom: 15px;">
                    ⏳ THỜI GIAN CÒN LẠI:
                </p>
                <div id="countdown-display">
                    01:00
                </div>
                <p style="font-size: 14px; color: #718096; margin-top: 10px;">
                    Mã OTP sẽ hết hạn sau <span id="seconds-display">60</span> giây
                </p>
            </div>

            <!-- Info Box -->
            <div class="info-box">
                <p style="font-size: 15px; color: #555; margin-bottom: 8px;">
                    <strong>📅 Ngày tạo:</strong> <?php echo e($created_at ?? now()->format('d/m/Y H:i:s')); ?>

                </p>
                <p style="font-size: 15px; color: #555; margin-bottom: 8px;">
                    <strong>⏰ Thời gian hiệu lực:</strong> <span id="expiry-seconds">60</span> giây
                </p>
                <p style="font-size: 15px; color: #555;">
                    <strong>🎯 Mục đích:</strong> <?php echo e($purpose ?? 'Đăng ký tài khoản mới'); ?>

                </p>
            </div>

            <!-- Progress Bar -->
            <div class="progress-container">
                <div id="progress-bar"></div>
            </div>

            <!-- Warning -->
            <div class="warning-box">
                <p style="font-size: 14px; color: #c53030; margin: 0; display: flex; align-items: center;">
                    <span style="font-size: 18px; margin-right: 8px;">⚠️</span>
                    <strong>Lưu ý quan trọng:</strong> Không chia sẻ mã OTP với bất kỳ ai. Mã này chỉ dành riêng cho bạn.
                </p>
            </div>

            <!-- Support -->
            <p style="font-size: 15px; color: #666; margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee;">
                Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email này.<br>
                Cần hỗ trợ? Liên hệ: 
                <a href="mailto:support@yourdomain.com" style="color: #667eea; text-decoration: none; font-weight: 500;">
                    support@yourdomain.com
                </a>
            </p>
        </div>

        <!-- Footer -->
        <div class="footer">
            <p style="font-size: 14px; color: #888; margin-bottom: 10px;">
                © <?php echo e(date('Y')); ?> <?php echo e(config('app.name', 'Your App Name')); ?>. All rights reserved.
            </p>
            <p style="font-size: 13px; color: #aaa;">
                Đây là email tự động, vui lòng không trả lời.
            </p>
        </div>
    </div>

    <!-- Cảnh báo nếu JavaScript bị tắt -->
    <noscript>
        <div class="no-js-message" style="display: block;">
            ⚠️ Đồng hồ đếm ngược không hoạt động. Mã OTP hết hạn sau 60 giây kể từ khi nhận email.
        </div>
    </noscript>

    <!-- JavaScript Countdown Timer -->
    <script>
        document.addEventListener('DOMContentLoaded', function() {
            const totalSeconds = 60; // 👈 60 giây
            let remainingSeconds = totalSeconds;
            
            const countdownElement = document.getElementById('countdown-display');
            const progressBar = document.getElementById('progress-bar');
            const secondsDisplay = document.getElementById('seconds-display');
            const expirySecondsDisplay = document.getElementById('expiry-seconds');
            
            // Hiển thị thời gian ban đầu
            secondsDisplay.textContent = totalSeconds;
            expirySecondsDisplay.textContent = totalSeconds;
            
            // Cập nhật đồng hồ đếm ngược mỗi giây
            const countdownInterval = setInterval(function() {
                remainingSeconds--;
                
                if (remainingSeconds <= 0) {
                    clearInterval(countdownInterval);
                    countdownElement.textContent = '00:00';
                    countdownElement.style.color = '#e53e3e';
                    progressBar.style.width = '0%';
                    
                    // Thêm hiệu ứng khi hết giờ
                    countdownElement.classList.add('blink');
                    return;
                }
                
                // Tính phút và giây
                const minutes = Math.floor(remainingSeconds / 60);
                const seconds = remainingSeconds % 60;
                
                // Hiển thị định dạng MM:SS
                countdownElement.textContent = 
                    minutes.toString().padStart(2, '0') + ':' + 
                    seconds.toString().padStart(2, '0');
                
                secondsDisplay.textContent = remainingSeconds;
                
                // Cập nhật progress bar
                const progressPercentage = (remainingSeconds / totalSeconds) * 100;
                progressBar.style.width = progressPercentage + '%';
                
                // Đổi màu khi sắp hết giờ
                if (remainingSeconds <= 10) { // 10 giây cuối
                    countdownElement.style.color = '#e53e3e';
                    progressBar.style.background = '#e53e3e';
                } else if (remainingSeconds <= 30) { // 30 giây cuối
                    countdownElement.style.color = '#ed8936';
                    progressBar.style.background = '#ed8936';
                }
                
            }, 1000);
        });
    </script>
</body>
</html><?php /**PATH D:\WORKSPACE\php\Celeste-Books.vn - Copy\backend\resources\views/emails/otp.blade.php ENDPATH**/ ?>