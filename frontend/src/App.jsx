import { Routes, Route } from "react-router-dom";

import Login from "../pages/Login";
import Signup from "../pages/Signup";
import Products from "../pages/Products";
import UploadProduct from "../pages/UploadProduct";

function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={<Login />}
      />

      <Route
        path="/login"
        element={<Login />}
      />

      <Route
        path="/signup"
        element={<Signup />}
      />

      <Route
        path="/products"
        element={<Products />}
      />

      <Route
        path="/upload"
        element={<UploadProduct />}
      />
    </Routes>
  );
}

export default App;