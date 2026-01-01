import ProductLayout from "../layouts/_ProductLayout";
import ProductPage from "../pages/Product/ProductPage";
import ProductDetailPage from "../pages/Product/ProductDetailPage";
import CartPage from "../pages/Product/CartPage";
import SearchBooksPage from "../pages/Product/SearchBooksPage";
import CheckoutPage from "../pages/Product/CheckoutPage";

const ProductRoutes = [
  {
    path: "/",
    element: (
      <ProductLayout>
        <ProductPage />
      </ProductLayout>
    ),
  },
  {
    path: "/san-pham/:id",
    element: (
      <ProductLayout>
        <ProductDetailPage />
      </ProductLayout>
    ),
  },
  {
    path: "/gio-hang/:userId",
    element: (
      <ProductLayout>
        <CartPage />
      </ProductLayout>
    ),
  },
  {
    path: "/tim-sach",
    element: (
      <ProductLayout>
        <SearchBooksPage />
      </ProductLayout>
    ),
  },
  {
    path: "/thanh-toan/:userId",
    element: (
      <ProductLayout>
        <CheckoutPage />
      </ProductLayout>
    ),
  }
];

export default ProductRoutes;
