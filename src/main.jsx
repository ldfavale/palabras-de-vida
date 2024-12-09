import React from 'react'
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


const Layout = () => {
  return (
    <div>
      <Header/>
      <Outlet/>
      <Footer/>
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
