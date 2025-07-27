import React, { useRef } from 'react';
import ReactDOM from 'react-dom/client';
import { Amplify } from 'aws-amplify';
import { ThemeProvider } from '@material-tailwind/react';
import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom';

import outputs from '../amplify_outputs.json';
import './index.css';

// Layout
import Header from './layout/Header';
import Footer from './layout/Footer';

// Pages
import App from './App';
import ShoppingPage from './pages/ShoppingPage';
import AboutUsPage from './pages/AboutUsPage';
import CreateProductPage from './pages/CreateProductPage';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import ConfirmSignUpPage from './pages/ConfirmSignUpPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import NewUserPage from './pages/NewUserPage';
import ProductPage from './pages/ProductPage';
import NotFoundPage from './components/NotFoundPage';

// Auth guards
import { ProtectedRoute } from './components/ProtectedRoute';
import { RedirectIfAuthenticated } from './components/RedirectIfAuthenticated';

// Toast
import { Toaster } from 'react-hot-toast';

// Config Amplify
Amplify.configure(outputs);

// Layout principal con Header/Footer
const Layout = () => {
  const footerRef = useRef<HTMLDivElement>(null);

  const scrollToFooter = () => {
    footerRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  };

  return (
    <div>
      <Toaster
        position="top-right"
        reverseOrder={false}
        toastOptions={{
          duration: 5000,
          success: { duration: 3000 },
          error: { duration: 5000 },
        }}
      />
      <Header onScrollToFooter={scrollToFooter} />
      <main style={{ minHeight: 'calc(100vh - 150px)' }}>
        <Outlet />
      </main>
      <Footer ref={footerRef} />
    </div>
  );
};

// Rutas públicas (redirige a / si ya está autenticado)
const publicRoutes = [
  { path: '/login', element: <LoginPage /> },
  { path: '/signup', element: <SignUpPage /> },
  { path: '/confirm-signup', element: <ConfirmSignUpPage /> },
  { path: '/forgot-password', element: <ForgotPasswordPage /> },
  { path: '/reset-password', element: <ResetPasswordPage /> },
].map(({ path, element }) => ({
  path,
  element: <RedirectIfAuthenticated>{element}</RedirectIfAuthenticated>,
}));

// Rutas protegidas (solo si está autenticado)
const protectedRoutes = [
  {
    path: 'products/new',
    element: <CreateProductPage />,
  },
  {
    path: 'users/new',
    element: <NewUserPage />,
  }
].map(({ path, element }) => ({
  path,
  element: <ProtectedRoute>{element}</ProtectedRoute>,
}));

// Rutas públicas normales dentro del layout
const layoutChildRoutes = [
  { path: '/', element: <App /> },
  { path: 'tienda', element: <ShoppingPage /> },
  { path: 'nosotros', element: <AboutUsPage /> },
  { path: 'product/:id', element: <ProductPage /> },
  ...protectedRoutes,
];

// Definición del router
const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: layoutChildRoutes,
  },
  ...publicRoutes,
  { path: '*', element: <NotFoundPage /> },
]);

// Render
const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('No se encontró el elemento root');

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <ThemeProvider>
      <RouterProvider router={router} />
    </ThemeProvider>
  </React.StrictMode>
);
