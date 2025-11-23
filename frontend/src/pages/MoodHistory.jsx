import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import './MoodHistory.css'

function MoodHistory({ username, onLogout }) {
  const navigate = useNavigate()
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchHistory()
  }, [username])

  const fetchHistory = async () => {
    try {
      const res = await axios.get(`/api/mood/history/${username}`)
      setHistory(res.data.history)
    } catch (err) {
      console.error('Error fetching history:', err)
    } finally {
      setLoading(false)
    }
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

  const handleBack = () => {
    navigate('/dashboard')
  }

  if (loading) {
    return (
      <div className="container">
        <div className="loading">
          <div className="spinner"></div>
          Loading history...
        </div>
      </div>
    )
  }

  return (
    <div className="container">
      <button className="logout-btn" onClick={onLogout}>
        Logout
      </button>

      <div className="header">
        <h1>Your Mood History</h1>
        <p>{history.length} total entries</p>
      </div>

      <div className="content">
        {history.length === 0 ? (
          <div className="empty-state">
            <p>No mood history yet. Take your first assessment!</p>
            <button className="btn" onClick={() => navigate('/questionnaire')}>
              Start Assessment
            </button>
          </div>
        ) : (
          <>
            <div className="history-timeline">
              {history.map((entry) => (
                <div key={entry.id} className="history-item">
                  <div className="history-date">
                    {new Date(entry.created_at).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                  <div
                    className="history-mood-badge"
                    style={{ backgroundColor: getMoodColor(entry.mood) }}
                  >
                    {entry.mood}
                  </div>
                </div>
              ))}
            </div>

            <div className="history-actions">
              <button className="btn btn-secondary" onClick={handleBack}>
                Back to Dashboard
              </button>
              <button className="btn" onClick={() => navigate('/questionnaire')}>
                New Assessment
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default MoodHistory
