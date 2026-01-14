import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const HeaderSearch = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Lấy keyword từ URL khi component mount
  const initialKeyword = searchParams.get("keyword") || "";
  const [keyword, setKeyword] = useState(initialKeyword);

  useEffect(() => {
    // Nếu URL thay đổi từ bên ngoài, update lại ô input
    setKeyword(initialKeyword);
  }, [initialKeyword]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const value = keyword.trim();
    if (!value) return;

    navigate(`/tim-sach?keyword=${encodeURIComponent(value)}`);
  };

  return (
    <form className="d-flex ms-auto" onSubmit={handleSubmit}>
      <div
        className="input-group"
        style={{ borderRadius: "0.5rem", border: "1px solid #ccc", overflow: "hidden" }}
      >
        <label htmlFor="search-input" className="visually-hidden">
          Tìm kiếm sách
        </label>

        <input
          type="search"
          id="search-input"
          name="search"
          className="form-control border-0 border-end"
          placeholder="Tìm kiếm sách..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          style={{ outline: "none" }}
        />
        <button type="submit" className="btn btn-primary border-start-0">
          <i className="bi bi-search"></i>
        </button>
      </div>
    </form>
  );
};

export default HeaderSearch;
