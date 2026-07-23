import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import AdminDashboard from "./pages/AdminDashboard";
import CartPage from "./pages/CartPage";
import CatalogPage from "./pages/CatalogPage";
import CheckoutPage from "./pages/CheckoutPage";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import OrdersPage from "./pages/OrdersPage";
import OrderSuccessPage from "./pages/OrderSuccessPage";
import ProductDetailsPage from "./pages/ProductDetailsPage";
import ProfilePage from "./pages/ProfilePage";
import SignupPage from "./pages/SignupPage";
import WishlistPage from "./pages/WishlistPage";

function App() { return <AuthProvider><BrowserRouter><div className="flex min-h-screen flex-col bg-[#0A0A0F] text-white"><Navbar /><main className="flex-1"><Routes><Route path="/" element={<HomePage />} /><Route path="/catalog" element={<CatalogPage />} /><Route path="/product/:id" element={<ProductDetailsPage />} /><Route path="/admin" element={<AdminDashboard />} /><Route path="/login" element={<LoginPage />} /><Route path="/signup" element={<SignupPage />} /><Route path="/cart" element={<CartPage />} /><Route path="/wishlist" element={<WishlistPage />} /><Route path="/checkout" element={<CheckoutPage />} /><Route path="/orders" element={<OrdersPage />} /><Route path="/profile" element={<ProfilePage />} /><Route path="/order-success/:id" element={<OrderSuccessPage />} /><Route path="*" element={<div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center"><h1 className="text-4xl font-bold">Page not found</h1><p className="text-gray-400">The page you requested doesn’t exist.</p><a href="/" className="rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 px-5 py-3 font-semibold">Back home</a></div>} /></Routes></main><Footer /></div></BrowserRouter></AuthProvider>; }
export default App;
