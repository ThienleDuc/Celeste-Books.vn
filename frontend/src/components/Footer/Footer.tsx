const Footer = () => {
  return (
    <footer className="py-4 bg-light text-dark mt-auto">
      <div className="footer_content container-fluid px-4">
        <div className="row">
          {/* Giới thiệu / thông tin chung */}
          <div className="col-md-6 mb-3 mb-md-0">
            <h5 className="fw-bold mb-2">Về Celeste Books</h5>
            <p className="text-muted mb-2">
              Celeste Books tự hào là cửa hàng sách trực tuyến cung cấp đa dạng các thể loại sách: từ giáo dục, kỹ năng sống, văn học, đến truyện tranh, tiểu thuyết. Chúng tôi cam kết mang đến trải nghiệm mua sắm dễ dàng, nhanh chóng, và dịch vụ chăm sóc khách hàng tận tâm. Hãy cùng khám phá kho sách phong phú của chúng tôi và tìm cho mình những cuốn sách yêu thích!
            </p>
            <p className="text-muted mb-1">
              <i className="bi bi-geo-alt-fill me-2"></i>
              123 Phố Sách, Quận 1, TP. Hồ Chí Minh
            </p>
            <p className="text-muted mb-1">
              <i className="bi bi-envelope-fill me-2"></i>
              info@celestebooks.vn
            </p>
            <p className="text-muted mb-0">
              <i className="bi bi-telephone-fill me-2"></i>
              +84 28 1234 5678
            </p>
          </div>

          {/* Hàng thứ 2: các tag / link phụ */}
          <div className="col-md-6 d-flex flex-column justify-content-between">
            <div className="mb-3 d-flex flex-wrap gap-2 justify-content-md-end">
              <a href="#" className="btn btn-outline-secondary btn-sm">Chính sách đổi trả</a>
              <a href="#" className="btn btn-outline-secondary btn-sm">Chính sách bảo mật</a>
              <a href="#" className="btn btn-outline-secondary btn-sm">Hướng dẫn thanh toán</a>
              <a href="#" className="btn btn-outline-secondary btn-sm">Hỗ trợ khách hàng</a>
              <a href="#" className="btn btn-outline-secondary btn-sm">Về chúng tôi</a>
            </div>

            {/* Mạng xã hội + bản quyền */}
            <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-md-end gap-2">
              {/* Mạng xã hội */}
              <div className="d-flex gap-2 mb-2 mb-md-0">
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-outline-primary btn-sm d-flex align-items-center justify-content-center"
                  style={{ width: '40px', height: '40px', borderRadius: '50%', transition: 'all 0.3s' }}
                >
                  <i className="bi bi-facebook"></i>
                </a>
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-outline-info btn-sm d-flex align-items-center justify-content-center"
                  style={{ width: '40px', height: '40px', borderRadius: '50%', transition: 'all 0.3s' }}
                >
                  <i className="bi bi-twitter"></i>
                </a>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-outline-danger btn-sm d-flex align-items-center justify-content-center"
                  style={{ width: '40px', height: '40px', borderRadius: '50%', transition: 'all 0.3s' }}
                >
                  <i className="bi bi-instagram"></i>
                </a>
              </div>

              {/* Bản quyền */}
              <div className="text-center text-md-end text-muted">
                &copy; 2025 Celeste Books. All rights reserved.
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
