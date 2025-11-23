import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import './MoodQuestionnaire.css'

const questions = [
  {
    id: 'q1',
    question: 'How are you feeling right now?',
    options: ['A. Calm', 'B. Neutral', 'C. Sad', 'D. Stressed', 'E. Overwhelmed', 'F. Happy']
  },
  {
    id: 'q2',
    question: 'Which emotion describes you best today?',
    options: ['A. Anxious', 'B. Tired', 'C. Low mood', 'D. Confident', 'E. Irritable', 'F. Content']
  },
  {
    id: 'q3',
    question: 'How stressed do you feel today?',
    options: ['A. Very low', 'B. Low', 'C. Moderate', 'D. High', 'E. Very high']
  },
  {
    id: 'q4',
    question: 'Are you experiencing physical symptoms of stress?',
    options: ['A. No symptoms', 'B. Mild fatigue/headache', 'C. Restlessness or tension', 'D. Trouble focusing', 'E. Unable to relax / very tense']
  },
  {
    id: 'q5',
    question: 'How motivated do you feel today?',
    options: ['A. Very motivated', 'B. Somewhat motivated', 'C. Neutral', 'D. Low motivation', 'E. No motivation at all']
  },
  {
    id: 'q6',
    question: 'Have you enjoyed your usual activities lately?',
    options: ['A. Yes, completely', 'B. Mostly', 'C. Sometimes', 'D. Rarely', 'E. Not at all']
  },
  {
    id: 'q7',
    question: 'How would you describe your mental energy?',
    options: ['A. Energized', 'B. Okay', 'C. A bit drained', 'D. Exhausted', 'E. Burned out']
  },
  {
    id: 'q8',
    question: 'How clear is your thinking today?',
    options: ['A. Very clear', 'B. Mostly clear', 'C. A bit foggy', 'D. Confused', 'E. Overwhelmed']
  },
  {
    id: 'q9',
    question: 'How connected do you feel to people around you?',
    options: ['A. Very connected', 'B. Somewhat connected', 'C. Neutral', 'D. A bit isolated', 'E. Very isolated']
  },
  {
    id: 'q10',
    question: 'How out of control do your emotions feel today?',
    options: ['A. Very stable', 'B. Mostly stable', 'C. Somewhat unstable', 'D. Unstable', 'E. Very unstable']
  }
]

function MoodQuestionnaire({ username, onLogout }) {
  const navigate = useNavigate()
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleAnswer = (questionId, answer) => {
    const newAnswers = { ...answers, [questionId]: answer.charAt(0) }
    setAnswers(newAnswers)

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    }
  }

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError('')

    try {
      const res = await axios.post('/api/mood/detect', {
        username,
        answers
      })

      // Navigate to chat with the mood log ID
      const sessionRes = await axios.post('/api/chat/start', {
        username,
        mood_log_id: res.data.log_id
      })

      navigate(`/chat/${sessionRes.data.session_id}`)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to analyze mood')
      setLoading(false)
    }
  }

  const progress = ((currentQuestion + 1) / questions.length) * 100

  return (
    <div className="container">
      <button className="logout-btn" onClick={onLogout}>
        Logout
      </button>

      <div className="header">
        <h1>Mood Assessment</h1>
        <p>Question {currentQuestion + 1} of {questions.length}</p>
      </div>

      <div className="content">
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }}></div>
        </div>

        {error && <div className="error">{error}</div>}

        <div className="question-card">
          <h2>{questions[currentQuestion].question}</h2>

          <div className="options">
            {questions[currentQuestion].options.map((option, index) => (
              <button
                key={index}
                className={`option-btn ${answers[questions[currentQuestion].id] === option.charAt(0) ? 'selected' : ''}`}
                onClick={() => handleAnswer(questions[currentQuestion].id, option)}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        <div className="navigation-buttons">
          {currentQuestion > 0 && (
            <button className="btn btn-secondary" onClick={handleBack}>
              Back
            </button>
          )}

          {currentQuestion === questions.length - 1 && Object.keys(answers).length === questions.length && (
            <button className="btn" onClick={handleSubmit} disabled={loading}>
              {loading ? 'Analyzing...' : 'Submit & Chat with Dr. Mira'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default MoodQuestionnaire
