import React, { useState } from 'react'
import axios from 'axios'
import './Login.css'

function Login({ onLogin }) {
  const [username, setUsername] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Check if user exists
      const checkRes = await axios.get(`/api/auth/check-user/${username}`)

      if (checkRes.data.action === 'login') {
        // Login existing user
        await axios.post('/api/auth/login', { username })
      } else {
        // Signup new user
        await axios.post('/api/auth/signup', { username })
      }

      onLogin(username)
    } catch (err) {
      setError(err.response?.data?.detail || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>Mental Health Analyzer</h1>
          <p>Your AI-powered wellness companion</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && <div className="error">{error}</div>}

          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              required
              disabled={loading}
            />
          </div>

          <button type="submit" className="btn" disabled={loading}>
            {loading ? 'Please wait...' : 'Continue'}
          </button>
        </form>

        <div className="login-footer">
          <p>Your data is private and secure</p>
        </div>
      </div>
    </div>
  )
}

export default Login
