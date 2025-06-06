import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

import { createBrowserRouter, RouterProvider } from 'react-router-dom'

import Home from './routes/Home.jsx';
import Login from './routes/Login.jsx';
import Register from './routes/Register.jsx'
import Logout from './routes/Logout.jsx'
import Addcategory from './routes/Addcategory.jsx'
import ErrorPage from './routes/ErrorPage.jsx'
import Charts from './routes/Charts.jsx'

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "Login",
        element: <Login />,
      },
      {
        path: "Register",
        element: <Register />,
      },
      {
        path: "Logout",
        element: <Logout />,
      },
      {
        path: "Addcategory",
        element: <Addcategory />,
      },
      {
        path: "Charts",
        element: <Charts/>,
      }
    ]
  },
])

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router}/>
  </React.StrictMode>,
);
