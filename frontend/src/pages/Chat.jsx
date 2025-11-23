import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import './Chat.css'

function Chat({ username, onLogout }) {
  const { sessionId } = useParams()
  const navigate = useNavigate()
  const [messages, setMessages] = useState([])
  const [inputMessage, setInputMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [mood, setMood] = useState('')
  const messagesEndRef = useRef(null)

  useEffect(() => {
    fetchChatHistory()
  }, [sessionId])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const fetchChatHistory = async () => {
    try {
      const res = await axios.get(`/api/chat/history/${sessionId}`)
      setMessages(res.data.messages)

      // Get session info to find mood
      const sessionsRes = await axios.get(`/api/chat/sessions/${username}`)
      const currentSession = sessionsRes.data.sessions.find(s => s.id === parseInt(sessionId))
      if (currentSession) {
        setMood(currentSession.mood)
      }
    } catch (err) {
      console.error('Error fetching chat history:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!inputMessage.trim() || sending) return

    const userMessage = inputMessage.trim()
    setInputMessage('')
    setSending(true)

    try {
      const res = await axios.post('/api/chat/message', {
        session_id: parseInt(sessionId),
        message: userMessage
      })

      // Fetch updated messages
      await fetchChatHistory()
    } catch (err) {
      console.error('Error sending message:', err)
    } finally {
      setSending(false)
    }
  }

  const handleEndChat = async () => {
    try {
      await axios.post(`/api/chat/end/${sessionId}`)
      navigate('/dashboard')
    } catch (err) {
      console.error('Error ending chat:', err)
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

  if (loading) {
    return (
      <div className="container">
        <div className="loading">
          <div className="spinner"></div>
          Loading chat...
        </div>
      </div>
    )
  }

  return (
    <div className="container chat-container">
      <button className="logout-btn" onClick={onLogout}>
        Logout
      </button>

      <div className="header">
        <h1>Chat with Dr. Mira</h1>
        {mood && (
          <div className="chat-mood-badge" style={{ backgroundColor: getMoodColor(mood) }}>
            Your mood: {mood}
          </div>
        )}
      </div>

      <div className="chat-content">
        <div className="messages-container">
          {messages.map((msg, index) => (
            <div key={index} className={`message ${msg.role}`}>
              <div className="message-bubble">
                {msg.content}
              </div>
              <div className="message-time">
                {new Date(msg.created_at).toLocaleTimeString()}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSendMessage} className="chat-input-form">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Type your message..."
            disabled={sending}
            className="chat-input"
          />
          <button type="submit" className="btn send-btn" disabled={sending || !inputMessage.trim()}>
            {sending ? 'Sending...' : 'Send'}
          </button>
        </form>

        <div className="chat-actions">
          <button className="btn btn-secondary" onClick={handleEndChat}>
            End Session & Return to Dashboard
          </button>
        </div>
      </div>
    </div>
  )
}

export default Chat
