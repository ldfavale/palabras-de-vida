import { Amplify } from 'aws-amplify';
import outputs from '../amplify_outputs.json';

Amplify.configure(outputs);
import React, { useRef } from 'react';
import ReactDOM from 'react-dom/client'
import './index.css'
import {
  createBrowserRouter,
  RouterProvider,
  Outlet
} from "react-router-dom";
import Header from './layout/Header';
import Footer from './layout/Footer';
import ShoppingPage from './pages/ShoppingPage';
import App from './App' 
import { ThemeProvider } from '@material-tailwind/react';
import AboutUsPage from './pages/AboutUsPage';


const Layout = () => {
  const footerRef = useRef(null);

  const scrollToFooter = () => {
    footerRef.current.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  };

  return (
    <div>
       <Header onScrollToFooter={scrollToFooter} />
      <Outlet/>
      <Footer ref={footerRef}/>
    </div>
  )
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout/>,
    children: [
      {
        path: "/",
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
    ]
  },

]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <RouterProvider router={router} />
    </ThemeProvider>
  </React.StrictMode>,
)
