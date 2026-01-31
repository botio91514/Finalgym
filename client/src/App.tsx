import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import RegistrationForm from './components/RegistrationForm';
import StorePage from './components/StorePage';
import Footer from './components/Footer';
import WebsiteNavbar from './components/WebsiteNavbar';
import Home from './components/Home';
import About from './components/About';
import Contact from './components/Contact';
import Gallery from './components/Gallery';
import AdminPanel from './components/AdminPanel';
import AdminLogin from './components/AdminLogin';
import ResetPassword from './components/ResetPassword';
import ProtectedRoute from './components/ProtectedRoute';
import ThankYou from './components/ThankYou';
import ThankYouPage from './components/ThankYouPage';
import RenewalForm from './components/RenewalForm';
import PaymentDetails from './components/PaymentDetails';


// Define API base URLs
// Vercel is used as the primary backend for better performance and response times
export const VERCEL_API_URL = 'https://finalgym-weld.vercel.app';
// Render is used for heavy tasks like PDF generation that might time out on serverless functions
export const RENDER_API_URL = 'https://gymbackend-uqt3.onrender.com';

const getApiUrl = () => {
  // Allow environment variable override, otherwise default to Vercel in production
  const url = import.meta.env.VITE_API_URL || (import.meta.env.PROD
    ? VERCEL_API_URL
    : 'http://localhost:3000');
  return url.replace(/\/$/, '');
};

export const API_BASE_URL = getApiUrl();




function App() {
  const [, setIsAdminLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = sessionStorage.getItem('token');
    if (token) {
      fetch(`${API_BASE_URL}/api/auth/verify`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include'
      })
        .then(response => {
          if (response.ok) {
            setIsAdminLoggedIn(true);
          } else {
            sessionStorage.removeItem('token');
            setIsAdminLoggedIn(false);
          }
          setLoading(false);
        })
        .catch(() => {
          sessionStorage.removeItem('token');
          setIsAdminLoggedIn(false);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-white">
        <span className="inline-flex items-center gap-3 text-xl">
          <Loader2 className="w-6 h-6 animate-spin text-yellow-500" />
          Loading...
        </span>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex flex-col">
        <Routes>
          {/* Admin login route - always accessible */}
          <Route
            path="/admin/login"
            element={<AdminLogin onLogin={() => setIsAdminLoggedIn(true)} />}
          />
          {/* Admin panel - always protected, requires authentication */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminPanel />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/reset-password/:token"
            element={<ResetPassword />}
          />
          <Route
            path="/"
            element={
              <>
                <WebsiteNavbar />
                <Home />
                <Footer />
              </>
            }
          />
          <Route
            path="/about"
            element={
              <>
                <WebsiteNavbar />
                <About />
                <Footer />
              </>
            }
          />
          <Route
            path="/gallery"
            element={
              <>
                <WebsiteNavbar />
                <Gallery />
                <Footer />
              </>
            }
          />
          <Route
            path="/contact"
            element={
              <>
                <WebsiteNavbar />
                <Contact />
                <Footer />
              </>
            }
          />
          <Route
            path="/join"
            element={
              <>
                <WebsiteNavbar />
                <div className="pt-20"> {/* Add padding for fixed navbar */}
                  <main className="container mx-auto px-4 py-8 flex-grow">
                    <RegistrationForm />
                  </main>
                </div>
                <Footer />
              </>
            }
          />
          <Route
            path="/thank-you"
            element={
              <>
                <WebsiteNavbar />
                <div className="pt-20">
                  <main className="container mx-auto px-4 py-8 flex-grow">
                    <ThankYou />
                  </main>
                </div>
                <Footer />
              </>
            }
          />
          <Route
            path="/renewal-thank-you"
            element={
              <>
                <WebsiteNavbar />
                <div className="pt-20">
                  <main className="container mx-auto px-4 py-8 flex-grow">
                    <ThankYouPage />
                  </main>
                </div>
                <Footer />
              </>
            }
          />
          <Route
            path="/renew-membership/:token"
            element={
              <>
                <WebsiteNavbar />
                <div className="pt-20">
                  <main className="container mx-auto px-4 py-8 flex-grow">
                    <RenewalForm />
                  </main>
                </div>
                <Footer />
              </>
            }
          />
          <Route
            path="/payment/:orderId"
            element={
              <>
                <WebsiteNavbar />
                <div className="pt-20">
                  <main className="container mx-auto px-4 py-8 flex-grow">
                    <PaymentDetails />
                  </main>
                </div>
                <Footer />
              </>
            }
          />
          <Route
            path="/store"
            element={
              <>
                <WebsiteNavbar />
                <div className="pt-16">
                  <StorePage />
                </div>
              </>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;