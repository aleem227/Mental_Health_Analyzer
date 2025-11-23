import React, { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import MoodQuestionnaire from './pages/MoodQuestionnaire'
import Chat from './pages/Chat'
import MoodHistory from './pages/MoodHistory'
import './App.css'

function App() {
  const [user, setUser] = useState(null)

  useEffect(() => {
    const savedUser = localStorage.getItem('username')
    if (savedUser) {
      setUser(savedUser)
    }
  }, [])

  const handleLogin = (username) => {
    setUser(username)
    localStorage.setItem('username', username)
  }

  const handleLogout = () => {
    setUser(null)
    localStorage.removeItem('username')
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={user ? <Navigate to="/dashboard" /> : <Login onLogin={handleLogin} />}
        />
        <Route
          path="/dashboard"
          element={user ? <Dashboard username={user} onLogout={handleLogout} /> : <Navigate to="/" />}
        />
        <Route
          path="/questionnaire"
          element={user ? <MoodQuestionnaire username={user} onLogout={handleLogout} /> : <Navigate to="/" />}
        />
        <Route
          path="/chat/:sessionId"
          element={user ? <Chat username={user} onLogout={handleLogout} /> : <Navigate to="/" />}
        />
        <Route
          path="/history"
          element={user ? <MoodHistory username={user} onLogout={handleLogout} /> : <Navigate to="/" />}
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App
