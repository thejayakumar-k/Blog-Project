import Home from "./components/Home";
import Blogs from "./components/Blogs";
import Navbar from "./components/common/Navbar";
import { BrowserRouter,Route,Routes, Navigate, useLocation } from "react-router-dom";
import Login from "./components/Login";
import Signup from "./components/Signup";
import Payment from "./components/Payment";
import VendorFeatures from "./components/admin/VendorFeatures";
import VendorCustomize from "./components/vendor/VendorCustomize";
import { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import auth from "./config/firebase";

function ProtectedRoute({ children }) {
  const [loading, setLoading] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setLoggedIn(!!user);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  if (loading) return null;
  if (!loggedIn) return <Navigate to="/login" />;
  return children;
}

function App() {
  return (
    <BrowserRouter>
    <AppContent />
    </BrowserRouter>
  );
}

function AppContent() {
  const location = useLocation();
  const hideNavbar = location.pathname === "/login" || location.pathname === "/signup";

  return (
   <div className="px-10  bg-white border rounded-md">
    {!hideNavbar && <Navbar/>}
    <Routes>
      <Route path="/" element={<Navigate to="/login"/>}></Route>
      <Route path="/home" element={<ProtectedRoute><Home/></ProtectedRoute>}></Route>
      <Route path="/blogs" element={<ProtectedRoute><Blogs/></ProtectedRoute>}></Route>
      <Route path="/payment" element={<ProtectedRoute><Payment/></ProtectedRoute>}></Route>
      <Route path="/login" element={<Login/>}></Route>
      <Route path="/signup" element={<Signup/>}></Route>
      <Route path="/admin/vendor-features" element={<ProtectedRoute><VendorFeatures/></ProtectedRoute>}></Route>
      <Route path="/vendor/customize" element={<ProtectedRoute><VendorCustomize/></ProtectedRoute>}></Route>
    </Routes>

   </div>
  );
}

export default App;
