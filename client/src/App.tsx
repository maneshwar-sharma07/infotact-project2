import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import CatalogPage from "./pages/CatalogPage";
import ProductDetailsPage from "./pages/ProductDetailsPage";
import AdminDashboard from "./pages/AdminDashboard";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>

        <div className="min-h-screen flex flex-col bg-[#0A0A0F] text-white">

          <Navbar />

          <main className="flex-1">

            <Routes>

              <Route path="/" element={<CatalogPage />} />
              <Route path="/catalog" element={<CatalogPage />} />

              <Route
                path="/product/:id"
                element={<ProductDetailsPage />}
              />

              <Route
                path="/admin"
                element={<AdminDashboard />}
              />

              <Route
                path="/login"
                element={<LoginPage />}
              />

              <Route
                path="/signup"
                element={<SignupPage />}
              />

            </Routes>

          </main>

          <Footer />

        </div>

      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;