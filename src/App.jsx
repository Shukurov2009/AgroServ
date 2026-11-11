import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { StoreProvider } from './context/StoreContext'
import Layout from './components/Layout'
import ScrollToTop from './components/ScrollToTop'
import { ProtectedRoute, RoleRoute } from './components/ProtectedRoute'
import Home from './pages/Home'
import About from './pages/About'
import Pricing from './pages/Pricing'
import Login from './pages/Login'
import Register from './pages/Register'
import Market from './pages/Market'
import ProductDetail from './pages/ProductDetail'
import Services from './pages/Services'
import ServiceDetail from './pages/ServiceDetail'
import Jobs from './pages/Jobs'
import Videos from './pages/Videos'
import AiAdvisor from './pages/AiAdvisor'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import Orders from './pages/Orders'
import Dashboard from './pages/Dashboard'
import Profile from './pages/Profile'
import Favorites from './pages/Favorites'
import SellerStore from './pages/SellerStore'
import MyServices from './pages/MyServices'
import Admin from './pages/Admin'
import { Privacy, Terms } from './pages/Legal'
import NotFound from './pages/NotFound'

export default function App() {
  return (
    <StoreProvider>
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/haqida" element={<About />} />
            <Route path="/narxlar" element={<Pricing />} />
            <Route path="/maxfiylik" element={<Privacy />} />
            <Route path="/shartlar" element={<Terms />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/bozor" element={<Market />} />
            <Route path="/mahsulot/:id" element={<ProductDetail />} />
            <Route path="/xizmatlar" element={<Services />} />
            <Route path="/xizmatlar/:id" element={<ServiceDetail />} />
            <Route path="/ishlar" element={<Jobs />} />
            <Route path="/videolar" element={<Videos />} />
            <Route path="/ai-maslahatchi" element={<AiAdvisor />} />
            <Route path="/savat" element={<Cart />} />
            <Route
              path="/tolov"
              element={
                <ProtectedRoute>
                  <Checkout />
                </ProtectedRoute>
              }
            />
            <Route
              path="/buyurtmalar"
              element={
                <ProtectedRoute>
                  <Orders />
                </ProtectedRoute>
              }
            />
            <Route
              path="/kabinet"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profil"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/sevimlilar"
              element={
                <ProtectedRoute>
                  <Favorites />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dokon"
              element={
                <RoleRoute roles={['seller', 'admin']}>
                  <SellerStore />
                </RoleRoute>
              }
            />
            <Route
              path="/xizmatlarim"
              element={
                <RoleRoute roles={['worker', 'agronomist', 'admin']}>
                  <MyServices />
                </RoleRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <RoleRoute roles={['admin']}>
                  <Admin />
                </RoleRoute>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3200,
            style: {
              borderRadius: '12px',
              background: '#ffffff',
              color: '#0b1f16',
              border: '1px solid rgba(6,78,59,0.12)',
              fontSize: '13px',
              fontWeight: 600,
              boxShadow: '0 18px 50px -20px rgba(6,78,59,0.35)',
            },
            success: { iconTheme: { primary: '#059669', secondary: '#ffffff' } },
            error: { iconTheme: { primary: '#e11d48', secondary: '#ffffff' } },
          }}
        />
      </BrowserRouter>
    </StoreProvider>
  )
}
