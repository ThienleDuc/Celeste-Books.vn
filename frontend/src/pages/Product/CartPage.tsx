import { useMemo, useState, useEffect, useRef } from "react";
import { Helmet } from "react-helmet";
import { useParams, useNavigate } from "react-router-dom";

import {
  sampleShoppingCarts,
  sampleCartItems,
  type CartItem,
} from "../../models/Cart/cart.model";
import { sampleProducts } from "../../models/Product/product.model";
import { Breadcrumbs, Link, Typography } from "@mui/material";
import type { CheckoutProduct } from "../../models/Checkout/checkout.model";
import QuantitySelector from "../../components/Utils/QuantitySelector";

// Định nghĩa interface cho dữ liệu sản phẩm cần truyền đi
const CartPage = () => {
  /* =========================================================
     GET USER ID FROM URL PARAMS
     ========================================================= */
  const { userId } = useParams<{ userId: string }>();
  
  // Fallback cho trường hợp không có userId trong URL
  const effectiveUserId = userId || "U001";

  /* =========================================================
     GET ACTIVE CART
     ========================================================= */
  const activeCart = useMemo(
    () =>
      sampleShoppingCarts.find(
        (c) => c.userId === effectiveUserId && c.status === "active"
      ),
    [effectiveUserId]
  );

  /* =========================================================
     CART ITEMS
     ========================================================= */
  const initialCartItems: CartItem[] = useMemo(() => {
    if (!activeCart) return [];
    return sampleCartItems.filter(
      (ci) => ci.cartId === activeCart.id
    );
  }, [activeCart]);

  const [cart, setCart] = useState<CartItem[]>(initialCartItems);
  const [checkedMap, setCheckedMap] = useState<Record<number, boolean>>({});

  /* init checked = true */
  useEffect(() => {
    const init: Record<number, boolean> = {};
    initialCartItems.forEach((item) => {
      init[item.id] = true;
    });
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCheckedMap(init);
    setCart(initialCartItems);
  }, [initialCartItems]);

  /* =========================================================
     HELPERS
     ========================================================= */
  const getProduct = (productId: number) =>
    sampleProducts.find((p) => p.product.id === productId);

  const getProductImage = (productId: number) => {
    const product = getProduct(productId);
    if (!product) return "/img/no-image.png";
    const img =
      product.images.find((i) => i.isPrimary) || product.images[0];
    return img?.imageUrl || "/img/no-image.png";
  };

  const getProductName = (productId: number) => {
    const product = getProduct(productId);
    return product?.product.name || "Không rõ sản phẩm";
  };

  /* =========================================================
     HANDLERS
     ========================================================= */
  const updateQuantity = (id: number, qty: number) => {
    if (qty < 1) return;
    setCart((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity: qty } : item
      )
    );
  };

  const removeItem = (id: number) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
    setCheckedMap((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const toggleAll = (checked: boolean) => {
    const next: Record<number, boolean> = {};
    cart.forEach((item) => {
      next[item.id] = checked;
    });
    setCheckedMap(next);
  };

  const toggleItemChecked = (itemId: number) => {
    setCheckedMap((prev) => ({
      ...prev,
      [itemId]: !prev[itemId],
    }));
  };

  /* =========================================================
     TOTAL CALC
     ========================================================= */
  const selectedItems = cart.filter((i) => checkedMap[i.id]);

  const totalQuantity = selectedItems.reduce(
    (sum, i) => sum + i.quantity,
    0
  );

  const totalPrice = selectedItems.reduce(
    (sum, i) => sum + i.priceAtTime * i.quantity,
    0
  );

  const handleDeleteSelected = () => {
    const selectedIds = Object.keys(checkedMap)
      .filter((id) => checkedMap[Number(id)])
      .map(Number);

    if (selectedIds.length === 0) return;

    setCart((prev) => prev.filter((item) => !selectedIds.includes(item.id)));
    setCheckedMap((prev) => {
      const newMap = { ...prev };
      selectedIds.forEach((id) => delete newMap[id]);
      return newMap;
    });
  };

  const getProductType = (productId: number) => {
    const product = sampleProducts.find(p => p.product.id === productId);
    return product?.details[0]?.productType ?? "N/A";
  };

  const [editingItemId, setEditingItemId] = useState<number | null>(null);
  const [selectedDetailId, setSelectedDetailId] = useState<number | null>(null);

  const popupRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        setEditingItemId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const navigate = useNavigate();

  /* =========================================================
     CHECKOUT HANDLER
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
      productType: getProductType(item.productId),
    }));

    // Tạo checkout data object
    const checkoutData = {
      userId: effectiveUserId,
      products: checkoutProducts,
      totalQuantity,
      totalPrice,
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
    // Chỉ truyền product IDs, không phải toàn bộ thông tin
    const productIds = checkoutProducts.map(p => p.productId).join(',');
    const queryParams = new URLSearchParams({
      userId: effectiveUserId,
      products: productIds, // Chỉ IDs, không phải toàn bộ JSON
      count: totalQuantity.toString(),
      amount: totalPrice.toString(),
    });

    // 3. Sử dụng router state cho toàn bộ dữ liệu
    navigate(`/thanh-toan/${effectiveUserId}?${queryParams.toString()}`, {
      state: checkoutData
    });
  };

  /* =========================================================
     RENDER
     ========================================================= */
  return (
    <div className="container mt-4">
      <Helmet>
        <title>Giỏ hàng - Celeste Books</title>
      </Helmet>
      
      <Breadcrumbs className="mb-2">
        <Link underline="hover" color="inherit" href="/">
          Trang chủ
        </Link>
        <Typography color="text.primary">
          Giỏ hàng của tôi {userId && `(Người dùng: ${userId})`}
        </Typography>
      </Breadcrumbs>
      
      <h5 className="h3 fw-bold mb-4 title-section">Giỏ hàng</h5>

      {cart.length === 0 ? (
        <p>Giỏ hàng đang trống.</p>
      ) : (
        <>
          {/* =================== CARD TABLE =================== */}
          <div className="card mb-3">
            <div className="card-body p-3">
              {/* HEADER */}
              <div className="d-flex gap-2 bg-light p-2 fw-bold">
                <div className="d-flex align-items-center" style={{ width: "5%" }}>
                  <input
                    type="checkbox"
                    checked={cart.every((i) => checkedMap[i.id])}
                    onChange={(e) => toggleAll(e.target.checked)}
                  />
                </div>
                <div className="d-flex align-items-center" style={{ width: "35%" }}>
                  Sản phẩm
                </div>
                <div className="d-flex align-items-center justify-content-end" style={{ width: "15%" }}>
                  Đơn giá
                </div>
                <div className="d-flex align-items-center justify-content-center" style={{ width: "15%" }}>
                  Số lượng
                </div>
                <div className="d-flex align-items-center justify-content-end" style={{ width: "15%" }}>
                  Số tiền
                </div>
                <div className="d-flex align-items-center justify-content-center" style={{ width: "15%" }}>
                  Thao tác
                </div>
              </div>
            </div>
          </div>
          
          <div className="card mb-3">
            <div className="card-body p-3">
              {/* BODY */}
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="d-flex align-items-center border-top p-2 gap-2"
                  style={{ cursor: "pointer" }}
                  onClick={() => toggleItemChecked(item.id)}
                >
                  {/* Checkbox */}
                  <div className="d-flex align-items-center" style={{ width: "5%" }}>
                    <input
                      type="checkbox"
                      checked={!!checkedMap[item.id]}
                      onChange={(e) =>
                        setCheckedMap((prev) => ({
                          ...prev,
                          [item.id]: e.target.checked,
                        }))
                      }
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>

                  {/* Product info */}
                  <div className="d-flex align-items-center gap-2" style={{ width: "35%" }}>
                    <img
                      src={getProductImage(item.productId)}
                      alt={getProductName(item.productId)}
                      width={80}
                      height={80}
                      className="rounded"
                    />
                    <div className="d-flex flex-column flex-grow-1">
                      <span className="text-ellipsis-1">{getProductName(item.productId)}</span>
                      <div className="d-flex align-items-center gap-2 mt-1">
                        <span className="badge bg-secondary">
                          {getProductType(item.productId)}
                        </span>
                        <button
                          type="button"
                          className="btn btn-sm btn-link text-decoration-none"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingItemId(item.id);
                          }}
                        >
                          <i className="bi bi-pencil-square"></i> Thay đổi
                        </button>
                      </div>

                      {/* Modal chọn phân loại */}
                      {editingItemId === item.id && (
                        <div
                          className="position-relative"
                          style={{ width: "100%" }}
                        >
                          <div
                            className="position-absolute bg-white border rounded p-3 top-100 start-0"
                            style={{
                              minWidth: "100%",
                              zIndex: 100,
                            }}
                            ref={popupRef}
                          >
                            <h6 className="mb-2">Chọn phân loại</h6>
                            <div className="d-flex gap-2 mb-3">
                              {getProduct(item.productId)?.details.map((d) => (
                                <button
                                  key={d.id}
                                  className={`btn btn-outline-primary d-flex align-items-center gap-1 ${
                                    selectedDetailId === d.id ? "active" : ""
                                  }`}
                                  style={{whiteSpace: "nowrap"}}
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setSelectedDetailId(d.id)
                                  }}
                                >
                                  <i className="bi bi-book"></i> {d.productType}
                                </button>
                              ))}
                            </div>
                            <div className="d-flex justify-content-end gap-2">
                              <button
                                className="btn btn-secondary btn-sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingItemId(null);
                                }}
                              >
                                Hủy
                              </button>
                              <button
                                className="btn btn-primary btn-sm"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  console.log(
                                    `CartItem ${item.id} đã thay đổi sang ProductDetailId ${selectedDetailId}`
                                  );
                                  setEditingItemId(null);
                                }}
                                disabled={!selectedDetailId}
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
                  <div className="d-flex align-items-center justify-content-end" style={{ width: "15%" }}>
                    {item.priceAtTime.toLocaleString()}₫
                  </div>

                  {/* Quantity */}
                  <div className="d-flex align-items-center justify-content-center" style={{ width: "15%" }}>
                    <QuantitySelector
                      id={`quantity-${item.id}`}
                      value={item.quantity}
                      stock={
                        sampleProducts
                          .find((p) => p.product.id === item.productId)?.details[0]?.stock ?? 1
                      }
                      onChange={(newValue) => updateQuantity(item.id, newValue)}
                    />
                  </div>

                  {/* Total */}
                  <div className="d-flex align-items-center justify-content-end fw-semibold text-primary" style={{ width: "15%" }}>
                    {(item.priceAtTime * item.quantity).toLocaleString()}₫
                  </div>

                  {/* Actions */}
                  <div className="d-flex align-items-center justify-content-center" style={{ width: "15%" }}>
                    <button
                      className="btn btn-icon-delete"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeItem(item.id);
                      }}
                      title="Xóa sản phẩm"
                    >
                      <i className="bi bi-trash-fill"></i>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ================= FOOTER ================= */}
          <div className="card p-3">
            <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
              <div className="d-flex align-items-center gap-2">
                <div className="d-flex align-items-center gap-2">
                  <input
                    id="select-all"
                    type="checkbox"
                    checked={cart.every((i) => checkedMap[i.id])}
                    onChange={(e) => toggleAll(e.target.checked)}
                  />
                  <label htmlFor="select-all">Chọn tất cả ({selectedItems.length} sản phẩm)</label>
                </div>
                <button
                  className="btn btn-link btn-sm text-decoration-none text-secondary"
                  disabled={selectedItems.length === 0}
                  onClick={handleDeleteSelected}
                >
                  Xóa ({selectedItems.length})
                </button>
              </div>

              <div className="d-flex align-items-end gap-2">
                Tổng cộng ({totalQuantity}):
                <span className="h5 text-primary fw-bold mb-0">
                  {totalPrice.toLocaleString()}₫
                </span>
              </div>

              <button
                className="btn btn-primary"
                disabled={selectedItems.length === 0}
                onClick={handleCheckout}
              >
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