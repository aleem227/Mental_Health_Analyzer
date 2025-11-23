import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import './Dashboard.css'

function Dashboard({ username, onLogout }) {
  const navigate = useNavigate()
  const [latestMood, setLatestMood] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLatestMood()
  }, [username])

  const fetchLatestMood = async () => {
    try {
      const res = await axios.get(`/api/mood/history/${username}`)
      if (res.data.history && res.data.history.length > 0) {
        setLatestMood(res.data.history[0])
      }
    } catch (err) {
      console.error('Error fetching mood history:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleStartQuestionnaire = () => {
    navigate('/questionnaire')
  }

  const handleViewHistory = () => {
    navigate('/history')
  }

  const getMoodColor = (mood) => {
    const colors = {
      'Happy/Calm': '#28a745',
      'Neutral': '#6c757d',
      'Stressed': '#ffc107',
      'Depressed/Low': '#dc3545',
      'Tired/Exhausted': '#17a2b8'
    }
    return colors[mood] || '#667eea'
  }

  return (
    <div className="container">
      <button className="logout-btn" onClick={onLogout}>
        Logout
      </button>

      <div className="header">
        <h1>Welcome, {username}!</h1>
        <p>Track your mental wellness journey</p>
      </div>

      <div className="content">
        {loading ? (
          <div className="loading">
            <div className="spinner"></div>
            Loading...
          </div>
        ) : (
          <>
            {latestMood && (
              <div className="mood-card">
                <h2>Your Latest Mood</h2>
                <div
                  className="mood-badge"
                  style={{ backgroundColor: getMoodColor(latestMood.mood) }}
                >
                  {latestMood.mood}
                </div>
                <p className="mood-date">
                  {new Date(latestMood.created_at).toLocaleString()}
                </p>
              </div>
            )}

            <div className="dashboard-actions">
              <button className="btn" onClick={handleStartQuestionnaire}>
                Take Mood Assessment
              </button>
              <button className="btn btn-secondary" onClick={handleViewHistory}>
                View Mood History
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default Dashboard
