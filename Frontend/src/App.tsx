import { useState } from 'react'
import Register from './components/Register';
import { ConfirmationSuccessful } from './components/ConfirmationSuccessful';
import { AuthProvider } from './components/context/AuthProvider';
import { FullRegistration } from './components/FullRegistration';
import { Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';

function App() {
  

  return (
    <>
      <div>
        <AuthProvider>
          <Routes>
              <Route path='/Register' element={<FullRegistration />}></Route>
              <Route path='/verify-success' element={<ConfirmationSuccessful />}></Route>
              <Route path='/Login' element={<Login />}></Route>
              <Route path='/' element={<Dashboard />}></Route>

          </Routes>
          
        </AuthProvider>
          
        
      </div>
    </>
  )
}

export default App
