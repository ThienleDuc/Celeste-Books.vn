import { useState, useEffect, useRef } from "react";
import { Helmet } from "react-helmet";
import { useParams, useNavigate } from "react-router-dom";
import { Breadcrumbs, Link, Typography, CircularProgress, Alert } from "@mui/material";
import axios from "axios"; 

// Components
import QuantitySelector from "../../components/Utils/QuantitySelector";

// Models (Interface)
import type { CheckoutProduct } from "../../models/Checkout/checkout.model";

/* ================= ĐỊNH NGHĨA INTERFACE (Khớp với Code cũ của bạn) ================= */
interface ProductDetail {
  id: number;
  product_id: number;
  product_type: string; // "Sách giấy" | "Sách điện tử"
  original_price: number;
  sale_price: number;
  stock: number;
}

// Interface cho Item trong State (CamelCase để khớp với handleCheckout cũ)
interface CartItemState {
  id: number;          // Cart Item ID
  cartId: number;
  productId: number;
  productDetailtId: number;
  quantity: number;
  priceAtTime: number;
  
  // Dữ liệu kèm theo để hiển thị
  productName: string;
  productImage: string;
  productType: string;
  stock: number;
  productSlug: string;
}

const CartPage = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();

  // 1. Lấy User ID thật
  const userInfoStr = localStorage.getItem("user_info");
  const userInfo = userInfoStr ? JSON.parse(userInfoStr) : null;
  const effectiveUserId = userInfo?.id || userId || "C01";

  // --- STATE ---
  const [cartItems, setCartItems] = useState<CartItemState[]>([]);
  const [checkedMap, setCheckedMap] = useState<Record<number, boolean>>({});
  const [loading, setLoading] = useState(true);
  
  // State quản lý danh sách biến thể cho Popup (thay thế sampleProducts)
  const [variantsMap, setVariantsMap] = useState<Record<number, ProductDetail[]>>({});

  // State cho Popup Edit
  const [editingItemId, setEditingItemId] = useState<number | null>(null);
  const [selectedDetailId, setSelectedDetailId] = useState<number | null>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  // --- 2. FETCH CART API ---
  const fetchCart = async () => {
    try {
      setLoading(true);
      setError(null);
      // Gọi API Backend
      const cartRes = await axios.get(`http://127.0.0.1:8000/api/shopping-carts/${effectiveUserId}`);
      
      if (cartRes.data.success && cartRes.data.data) {
        const rawItems = cartRes.data.data.items || [];

        const mappedItems: CartItemState[] = rawItems.map((item: any) => {
            const product = item.product || {};
            const detail = item.product_detail || {};
            
            // Lấy ảnh chính
            const primaryImg = product.images?.find((img: any) => img.is_primary === 1) || product.images?.[0];
            
            return {
                id: item.id,
                cartId: item.cart_id,
                productId: item.product_id,
                productDetailtId: item.product_details_id, 
                quantity: item.quantity,
                priceAtTime: Number(item.price_at_time),
                
                productName: product.name || "Sản phẩm",
                productImage: primaryImg?.image_url || "/img/no-image.png",
                productType: detail.product_type || "N/A",
                // [MỚI] Lấy slug từ product để dùng cho việc fetch variants
                productSlug: product.slug || "", 
                stock: detail.stock ?? 0
            };
        });

        setCartItems(mappedItems);
        
        // Init checked map
        setCheckedMap(prev => {
            const next = { ...prev };
            mappedItems.forEach(item => {
                if (next[item.id] === undefined) next[item.id] = true;
            });
            return next;
        });

      } else {
        setCartItems([]);
      }
    } catch (err) {
      console.error("Lỗi tải giỏ hàng:", err);
      setError("Không thể tải giỏ hàng.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCart(); }, [effectiveUserId]);

  // Click outside popup
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        setEditingItemId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- 3. FETCH VARIANTS (Khi mở popup) ---
  // Thay thế cho việc tìm trong sampleProducts
  const fetchProductVariants = async (productId: number, slug: string) => {
      if (variantsMap[productId]) return; 
      if (!slug) return;

      try {
          // Gọi API với slug để lọt vào nhánh "TRƯỜNG HỢP 1" của Controller
          // Lưu ý: Controller bạn gửi là ProductController hay ProductDetailController?
          // Dựa vào code bạn gửi là 'public function index', tôi giả định route là /api/products (hoặc route trỏ về hàm đó)
          // Nếu Controller đó gắn với /api/product-details thì URL dưới đây đúng. 
          // Nếu nó gắn với /api/products thì sửa lại URL nhé.
          // Dựa vào context cũ, tôi dùng: http://127.0.0.1:8000/api/product-details (hoặc api/products tùy route bạn gán)
          const res = await axios.get(`http://127.0.0.1:8000/api/product-details?slug=${slug}`); 
          // Hoặc nếu function index đó thuộc ProductController:
          // const res = await axios.get(`http://127.0.0.1:8000/api/products?slug=${slug}`);

          if (res.data.status) {
              // Backend trả về: { status: true, data: { ...productInfo, product_details: [...] } }
              // Lưu ý: Laravel khi trả về JSON quan hệ thường là snake_case: product_details
              // Hoặc camelCase: productDetails tùy config. Tôi sẽ check cả 2.
              const productData = res.data.data;
              const details = productData.product_details || productData.productDetails || [];

              setVariantsMap(prev => ({
                  ...prev,
                  [productId]: details
              }));
          }
      } catch (err) {
          console.error("Lỗi tải biến thể:", err);
      }
  };
  // --- 4. HELPER FUNCTIONS (Đã chỉnh sửa để dùng dữ liệu thật) ---
  
  // Fake hàm getProduct để khớp với HTML cũ của bạn
  const getProduct = (productId: number) => {
      return {
          details: variantsMap[productId] || [] // Trả về list biến thể từ API
      };
  };

  const getProductImage = (productId: number) => {
      return cartItems.find(i => i.productId === productId)?.productImage || "/img/no-image.png";
  };

  const getProductName = (productId: number) => {
      return cartItems.find(i => i.productId === productId)?.productName || "Sản phẩm";
  };

  const getProductType = (productId: number) => {
      // Tìm item trong giỏ có productId này (Lưu ý: nếu 1 sp có 2 dòng trong giỏ thì logic này lấy dòng đầu)
      return cartItems.find(i => i.productId === productId)?.productType || "N/A";
  };

  // --- 5. HANDLERS API ---

  const updateQuantity = async (itemId: number, newQty: number) => {
    if (newQty < 1) return;
    const oldCart = [...cartItems];
    setCartItems(prev => prev.map(item => item.id === itemId ? { ...item, quantity: newQty } : item));

    try {
      await axios.put(`http://127.0.0.1:8000/api/shopping-carts/item/${itemId}`, { quantity: newQty });
    } catch (err: any) {
      alert(err.response?.data?.message || "Lỗi cập nhật số lượng");
      setCartItems(oldCart);
    }
  };

  const removeItem = async (itemId: number) => {
    if (!window.confirm("Xóa sản phẩm này?")) return;
    try {
      await axios.delete(`http://127.0.0.1:8000/api/shopping-carts/item/${itemId}`);
      setCartItems(prev => prev.filter(item => item.id !== itemId));
      const nextChecked = { ...checkedMap };
      delete nextChecked[itemId];
      setCheckedMap(nextChecked);
    } catch (err) { alert("Lỗi khi xóa"); }
  };

  const handleDeleteSelected = async () => {
    const selectedIds = Object.keys(checkedMap).filter(id => checkedMap[Number(id)]).map(Number);
    if (selectedIds.length === 0) return;
    if (!window.confirm(`Xóa ${selectedIds.length} sản phẩm đã chọn?`)) return;

    try {
        await Promise.all(selectedIds.map(id => axios.delete(`http://127.0.0.1:8000/api/shopping-carts/item/${id}`)));
        setCartItems(prev => prev.filter(item => !selectedIds.includes(item.id)));
        setCheckedMap({});
        alert("Đã xóa thành công");
    } catch (err) { alert("Lỗi khi xóa nhiều"); }
  };

const handleChangeVariant = async (cartItemId: number, newDetailId: number) => {
    // 1. Tìm item hiện tại trong giỏ hàng để lấy số lượng đang có
    const currentItem = cartItems.find(item => item.id === cartItemId);
    
    if (!currentItem) {
        alert("Không tìm thấy sản phẩm trong giỏ hàng");
        return;
    }

    try {
        // 2. Gửi cả product_details_id VÀ quantity
        await axios.put(`http://127.0.0.1:8000/api/shopping-carts/item/${cartItemId}`, { 
            product_details_id: newDetailId,
            quantity: currentItem.quantity // [QUAN TRỌNG] Phải gửi kèm số lượng cũ
        });

        await fetchCart(); 
        setEditingItemId(null);
        alert("Đã đổi loại sản phẩm thành công!");
    } catch (err: any) {
        // Log lỗi chi tiết để dễ debug
        console.error("Lỗi đổi loại:", err.response?.data);
        alert(err.response?.data?.message || "Lỗi đổi loại sản phẩm");
    }
  };

  const toggleAll = (checked: boolean) => {
    const next: Record<number, boolean> = {};
    cartItems.forEach(i => next[i.id] = checked);
    setCheckedMap(next);
  };

  const toggleItemChecked = (itemId: number) => {
    setCheckedMap((prev) => ({ ...prev, [itemId]: !prev[itemId] }));
  };

  // --- CALCULATION ---
  const selectedItems = cartItems.filter(i => checkedMap[i.id]);
  const totalQuantity = selectedItems.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = selectedItems.reduce((sum, i) => sum + i.priceAtTime * i.quantity, 0);

  /* =========================================================
     CHECKOUT HANDLER (GIỮ NGUYÊN CODE CỦA BẠN)
     ========================================================= */
  const handleCheckout = () => {
    if (selectedItems.length === 0) return;

    // Chuyển đổi selectedItems thành định dạng phù hợp cho trang thanh toán
    const checkoutProducts: CheckoutProduct[] = selectedItems.map(item => ({
      id: item.id,
      productId: item.productId,
      quantity: item.quantity,
      priceAtTime: item.priceAtTime,
      name: getProductName(item.productId),
      image: getProductImage(item.productId),
      productType: getProductType(item.productId), // Hàm này giờ lấy từ state, không phải mock
    }));

    // Tạo checkout data object
    const checkoutData = {
      userId: effectiveUserId,
      products: checkoutProducts,
      totalQuantity,
      totalPrice,
      checkoutType: "cart",
      timestamp: new Date().toISOString()
    };

    // ========== GIẢI PHÁP TỐI ƯU ==========
    
    // 1. Lưu vào localStorage (backup, chống mất dữ liệu khi refresh)
    const storageKey = `checkout_${effectiveUserId}`;
    localStorage.setItem(storageKey, JSON.stringify(checkoutData));
    
    // Set expiration time (24 hours)
    const expiration = new Date().getTime() + (24 * 60 * 60 * 1000);
    localStorage.setItem(`${storageKey}_expiry`, expiration.toString());

    // 2. Truyền chỉ ID sản phẩm qua URL (nếu cần)
    const productIds = checkoutProducts.map(p => p.productId).join(',');
    const queryParams = new URLSearchParams({
      userId: effectiveUserId,
      products: productIds,
      count: totalQuantity.toString(),
      amount: totalPrice.toString(),
      checkoutType: "cart",
    });

    // 3. Sử dụng router state cho toàn bộ dữ liệu
    navigate(`/thanh-toan/${effectiveUserId}?${queryParams.toString()}`, {
      state: checkoutData
    });
  };

  if (loading) return <div className="text-center mt-5"><CircularProgress /><p>Đang tải giỏ hàng...</p></div>;

  return (
    <div className="container mt-4">
      <Helmet><title>Giỏ hàng - Celeste Books</title></Helmet>
      <Breadcrumbs className="mb-2">
        <Link underline="hover" color="inherit" href="/">Trang chủ</Link>
        <Typography color="text.primary">Giỏ hàng</Typography>
      </Breadcrumbs>
      
      <h5 className="h3 fw-bold mb-4 title-section">Giỏ hàng ({cartItems.length})</h5>

      {cartItems.length === 0 ? <Alert severity="info">Giỏ hàng đang trống.</Alert> : (
        <>
          {/* HEADER (Giữ nguyên HTML) */}
          <div className="card mb-3">
            <div className="card-body p-3">
              <div className="d-flex gap-2 bg-light p-2 fw-bold">
                <div className="d-flex align-items-center" style={{ width: "5%" }}>
                  <input type="checkbox" checked={cartItems.every((i) => checkedMap[i.id])} onChange={(e) => toggleAll(e.target.checked)} />
                </div>
                <div className="d-flex align-items-center" style={{ width: "35%" }}>Sản phẩm</div>
                <div className="d-flex align-items-center justify-content-end" style={{ width: "15%" }}>Đơn giá</div>
                <div className="d-flex align-items-center justify-content-center" style={{ width: "15%" }}>Số lượng</div>
                <div className="d-flex align-items-center justify-content-end" style={{ width: "15%" }}>Số tiền</div>
                <div className="d-flex align-items-center justify-content-center" style={{ width: "15%" }}>Thao tác</div>
              </div>
            </div>
          </div>
          
          {/* BODY (Giữ nguyên HTML, thay đổi nguồn dữ liệu) */}
          <div className="card mb-3">
            <div className="card-body p-3">
              {cartItems.map((item) => (
                <div key={item.id} className="d-flex align-items-center border-top p-2 gap-2" style={{ cursor: "pointer" }} onClick={() => toggleItemChecked(item.id)}>
                  
                  {/* Checkbox */}
                  <div className="d-flex align-items-center" style={{ width: "5%" }}>
                    <input type="checkbox" checked={!!checkedMap[item.id]} onChange={() => {}} onClick={(e) => e.stopPropagation()} />
                  </div>

                  {/* Product info */}
                  <div className="d-flex align-items-center gap-2" style={{ width: "35%" }}>
                    <img src={item.productImage} alt={item.productName} width={80} height={80} className="rounded" />
                    <div className="d-flex flex-column flex-grow-1">
                      <span className="text-ellipsis-1">{item.productName}</span>
                      <div className="d-flex align-items-center gap-2 mt-1">
                        <span className="badge bg-secondary">{item.productType}</span>
                        <button
                          type="button"
                          className="btn btn-sm btn-link text-decoration-none"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingItemId(item.id);
                            setSelectedDetailId(item.productDetailtId); // Set default checked
                            fetchProductVariants(item.productId, item.productSlug); // [MỚI] Tải biến thể từ API khi bấm nút
                          }}
                        >
                          <i className="bi bi-pencil-square"></i> Thay đổi
                        </button>
                      </div>

                      {/* Modal chọn phân loại */}
                      {editingItemId === item.id && (
                        <div className="position-relative" style={{ width: "100%" }}>
                          <div className="position-absolute bg-white border rounded p-3 top-100 start-0" style={{ minWidth: "100%", zIndex: 100 }} ref={popupRef} onClick={e => e.stopPropagation()}>
                            <h6 className="mb-2">Chọn phân loại</h6>
                            <div className="d-flex gap-2 mb-3 flex-wrap">
                              {variantsMap[item.productId] && variantsMap[item.productId].length > 0 ? (
                                  variantsMap[item.productId].map((d: any) => {
                                    // Xử lý dữ liệu hiển thị an toàn
                                    const typeName = d.product_type || d.productType || "Mặc định";
                                    const price = d.sale_price !== undefined ? d.sale_price : d.salePrice;
                                    const priceDisplay = price ? Number(price).toLocaleString() : "0";

                                    return (
                                      <button
                                        key={d.id}
                                        className={`btn btn-outline-primary d-flex align-items-center gap-1 ${selectedDetailId === d.id ? "active" : ""}`}
                                        style={{whiteSpace: "nowrap"}}
                                        onClick={(e) => { e.stopPropagation(); setSelectedDetailId(d.id); }}
                                      >
                                        <i className="bi bi-book"></i> {typeName} - {priceDisplay}₫
                                      </button>
                                    );
                                  })
                              ) : (
                                  <small className="text-muted">Đang tải...</small>
                              )}
                            </div>
                            <div className="d-flex justify-content-end gap-2">
                              <button className="btn btn-secondary btn-sm" onClick={(e) => { e.stopPropagation(); setEditingItemId(null); }}>Hủy</button>
                              <button
                                className="btn btn-primary btn-sm"
                                onClick={(e) => { e.stopPropagation(); handleChangeVariant(item.id, selectedDetailId!); }}
                                disabled={!selectedDetailId || selectedDetailId === item.productDetailtId}
                              >
                                Xác nhận
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Price */}
                  <div className="d-flex align-items-center justify-content-end" style={{ width: "15%" }}>{item.priceAtTime.toLocaleString()}₫</div>

                  {/* Quantity */}
                  <div className="d-flex align-items-center justify-content-center" style={{ width: "15%" }}>
                    <div onClick={(e) => e.stopPropagation()}>
                        <QuantitySelector
                          id={`quantity-${item.id}`}
                          value={item.quantity}
                          stock={item.stock} // Lấy tồn kho thật từ API
                          onChange={(newValue) => updateQuantity(item.id, newValue)}
                        />
                    </div>
                  </div>

                  {/* Total */}
                  <div className="d-flex align-items-center justify-content-end fw-semibold text-primary" style={{ width: "15%" }}>
                    {(item.priceAtTime * item.quantity).toLocaleString()}₫
                  </div>

                  {/* Actions */}
                  <div className="d-flex align-items-center justify-content-center" style={{ width: "15%" }}>
                    <button className="btn btn-icon-delete" onClick={(e) => { e.stopPropagation(); removeItem(item.id); }} title="Xóa sản phẩm">
                      <i className="bi bi-trash-fill"></i>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* FOOTER (Giữ nguyên HTML) */}
          <div className="card p-3">
            <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
              <div className="d-flex align-items-center gap-2">
                <div className="d-flex align-items-center gap-2">
                  <input id="select-all" type="checkbox" checked={cartItems.length > 0 && cartItems.every((i) => checkedMap[i.id])} onChange={(e) => toggleAll(e.target.checked)} />
                  <label htmlFor="select-all">Chọn tất cả ({selectedItems.length} sản phẩm)</label>
                </div>
                <button className="btn btn-link btn-sm text-decoration-none text-secondary" disabled={selectedItems.length === 0} onClick={handleDeleteSelected}>
                  Xóa ({selectedItems.length})
                </button>
              </div>

              <div className="d-flex align-items-end gap-2">
                Tổng cộng ({totalQuantity}):
                <span className="h5 text-primary fw-bold mb-0">{totalPrice.toLocaleString()}₫</span>
              </div>

              <button className="btn btn-primary" disabled={selectedItems.length === 0} onClick={handleCheckout}>
                Mua hàng
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CartPage;