// App.tsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainRoutesPath from "./routes/MainRoutes";
import ProfileRoutes from "./routes/ProfileRoutes";
import AuthRoutes from "./routes/AuthRoutes";
import ProductRoutes from "./routes/ProductRoutes";

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Main routes */}
        {MainRoutesPath.map(({ path, element }) => (
          <Route key={path} path={path} element={element} />
        ))}

        {/* Profile routes */}
        {ProfileRoutes.map(({ path, element }) => (
          <Route key={path} path={path} element={element} />
        ))}
        {/* Auth routes */}
        {AuthRoutes.map(({ path, element }) => (
          <Route key={path} path={path} element={element} />
        ))}

        {/* Product routes */}
        {ProductRoutes.map(({ path, element }) => (
          <Route key={path} path={path} element={element} />
        ))}

        {/* 404 Not Found */}
        <Route path="*" element={<div>404 Not Found</div>} />
      </Routes>
    </Router>
  );
};

export default App;
