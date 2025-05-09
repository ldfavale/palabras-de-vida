import React, { useRef } from 'react';
import ReactDOM from 'react-dom/client';
import { Amplify } from 'aws-amplify';
import { ThemeProvider } from '@material-tailwind/react';
import { createBrowserRouter, RouterProvider, Outlet } from "react-router-dom";

import outputs from '../amplify_outputs.json'; // Asegúrate que la ruta es correcta
import './index.css';

// Layout
import Header from './layout/Header';
import Footer from './layout/Footer';

// --- Páginas Existentes ---
import App from './App'; // Tu página principal/Home
import ShoppingPage from './pages/ShoppingPage';
import AboutUsPage from './pages/AboutUsPage';
import CreateProductPage from './pages/CreateProductPage'; // La página a proteger

// --- NUEVAS PÁGINAS DE AUTENTICACIÓN ---
// Asegúrate que las rutas de importación sean correctas
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import ConfirmSignUpPage from './pages/ConfirmSignUpPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';

// --- COMPONENTE PROTECTEDROUTE ---
import { ProtectedRoute } from './components/ProtectedRoute'; // Asegúrate que la ruta es correcta

// Configura Amplify
Amplify.configure(outputs);

// --- Layout Principal (con Header/Footer) ---
const Layout = () => {
  const footerRef = useRef<HTMLDivElement>(null); // Tipado del ref

  const scrollToFooter = () => {
    footerRef.current?.scrollIntoView({ // Uso de optional chaining por si el ref no está listo
      behavior: 'smooth',
      block: 'start',
    });
  };

  return (
    <div>
      <Header onScrollToFooter={scrollToFooter} />
      {/* Es buena práctica envolver el Outlet en un <main> */}
      <main style={{ minHeight: 'calc(100vh - 150px)' }}> {/* Ejemplo para evitar que footer suba */}
          <Outlet/>
      </main>
      <Footer ref={footerRef}/>
    </div>
  );
};

// --- Definición del Router ---
const router = createBrowserRouter([
  {
    // Rutas que usan el Layout principal (Header/Footer)
    path: "/",
    element: <Layout/>,
    children: [
      {
        path: "/", // Ruta raíz dentro del layout
        element: <App/>,
      },
      {
        path: "tienda",
        element: <ShoppingPage/>,
      },
      {
        path: "nosotros",
        element: <AboutUsPage/>,
      },
      {
        // --- ¡RUTA PROTEGIDA! ---
        // Envolvemos el elemento de la página con ProtectedRoute
        path: "products/new",
        element: (
          <ProtectedRoute>
            <CreateProductPage/>
          </ProtectedRoute>
        ),
      },
      // Puedes añadir aquí otras rutas que necesiten el Layout principal
    ]
  },
  // --- RUTAS DE AUTENTICACIÓN (SIN Layout Principal) ---
  // Estas rutas se definen fuera del objeto de Layout para que no
  // tengan el Header/Footer estándar, lo cual es común para páginas de auth.
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/signup",
    element: <SignUpPage />,
  },
  {
    // Esta ruta recibe el código de confirmación
    path: "/confirm-signup",
    element: <ConfirmSignUpPage />,
  },
  {
    path: "/forgot-password",
    element: <ForgotPasswordPage />,
  },
  {
    // Esta ruta maneja la confirmación del reseteo
    path: "/reset-password",
    element: <ResetPasswordPage />,
  },
  // Considera añadir una ruta comodín para páginas no encontradas (404)
  // { path: "*", element: <NotFoundPage /> }
]);

// --- Renderizado de la Aplicación ---
const rootElement = document.getElementById('root');
if (!rootElement) throw new Error("Failed to find the root element"); // Comprobación

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    {/* ThemeProvider envuelve todo */}
    <ThemeProvider>
      {/* RouterProvider gestiona las rutas */}
      <RouterProvider router={router} />
    </ThemeProvider>
  </React.StrictMode>,
);