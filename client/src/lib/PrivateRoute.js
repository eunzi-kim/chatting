import React from 'react'
import { Outlet, Navigate } from 'react-router-dom'

function PrivateRoute() {
  const user = localStorage.getItem('userinfo');
  
  return (
    <>
      {user ? <Outlet /> : <Navigate to='/login' />}
    </> 
  )
};

export default PrivateRoute;