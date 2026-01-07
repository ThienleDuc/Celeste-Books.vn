import MainLayout from "../layouts/_MainLayout.tsx";
import PageLichTrinhTheoNgay from "../pages/Schedule/PageLichTrinhTheoNgay.tsx";
import PageLichTrinhChuyenTau from "../pages/Schedule/PageLichTrinhChuyenTau.tsx";
import PageLichTrinhPhanCong from "../pages/Schedule/PageLichTrinhPhanCong.tsx";
import PagePhanCongLaiTau from "../pages/Schedule/PagePhanCongLaiTau.tsx";
import PageYeuCauTamHoan from "../pages/Schedule/PageYeuCauTamHoan.tsx";
import PageDungKhanCap from "../pages/Schedule/PageDungKhanCap.tsx";

const MainRoutes = [
  { path: "/lich-trinh", element: <MainLayout><PageLichTrinhTheoNgay /></MainLayout> },
  { path: "/lich-trinh/chuyen-tau/:maLichTrinh", element: <MainLayout><PageLichTrinhChuyenTau /></MainLayout> },
  { path: "/chuyen-tau/lich-trinh/:maChuyenTau", element: <MainLayout><PageLichTrinhPhanCong /></MainLayout> },
  { path: "/chuyen-tau/lich-trinh/:maChuyenTau/phan-cong/:maLichTrinhPhanCong", element: <MainLayout><PagePhanCongLaiTau /></MainLayout> },
  { path: "/chuyen-tau/tam-hoan/:maChuyenTau", element: <MainLayout><PageYeuCauTamHoan /></MainLayout> },
  { path: "/chuyen-tau/dung-khan-cap/:maChuyenTau", element: <MainLayout><PageDungKhanCap /></MainLayout> },
];

export default MainRoutes;
