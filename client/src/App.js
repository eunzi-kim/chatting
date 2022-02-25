import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import PrivateRoute from './lib/PrivateRoute';

import Login from './Component/Login';
import Signup from './Component/Signup';
import Chat from './Component/Chat';
import Room from './Component/Room';

import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route exact element={<PrivateRoute />}>
          <Route path='/:roomid' element={<Chat/>} />
          <Route path='/' element={<Room/>} />
        </Route>
        <Route path='/login' element={<Login/>} />
        <Route path='/signup' element={<Signup/>} />
        
      </Routes>
    </BrowserRouter>
  );
}

export default App;