import { useRef, useState } from 'react'
import axios from 'axios'
import { supabase } from '../supabase'

export default function Voice() {
  const [text, setText] = useState('')
  const [recording, setRecording] = useState(false)
  const [loading, setLoading] = useState(false)
  const [subject, setSubject] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState('')
  const [churnRisk, setChurnRisk] = useState('')
  const [etaHours, setEtaHours] = useState(null)
  const recognitionRef = useRef(null)

  const startRecording = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new SpeechRecognition()
    recognition.lang = 'en-US'
    recognition.interimResults = false
    recognition.onresult = (event) => {
      setText(event.results[0][0].transcript)
    }
    recognition.start()
    recognitionRef.current = recognition
    setRecording(true)
  }

  const stopRecording = () => {
    recognitionRef.current?.stop()
    setRecording(false)
  }

  const generateRephrasedContent = async (inputText) => {
    try {
      setLoading(true)
      const prompt = `Rephrase the following user's complaint into a Subject and a Description, classify its Priority as high, medium, or low, estimate Churn Risk as high, medium, or low, and provide an ETA in hours. Respond in this format:

Subject: <short title>
Description: <detailed explanation>
Priority: <high | medium | low>
Churn Risk: <high | medium | low>
ETA: <number of hours>

Complaint:
${inputText}`

      const response = await axios.post('http://localhost:11434/api/generate', {
        model: 'mistral',
        prompt,
        stream: false
      })

      const result = response.data.response.trim()

      const match = result.match(
        /Subject:\s*(.+?)\n+Description:\s*(.+?)\n+Priority:\s*(.+?)\n+Churn Risk:\s*(.+?)\n+ETA:\s*(\d+)/i
      )

      if (match) {
        return {
          subject: match[1].trim(),
          description: match[2].trim(),
          priority: match[3].trim().toLowerCase(),
          churn_risk: match[4].trim().toLowerCase(),
          eta_hours: parseInt(match[5].trim())
        }
      } else {
        return {
          subject: 'Voice Complaint',
          description: result,
          priority: 'medium',
          churn_risk: 'medium',
          eta_hours: 24
        }
      }
    } catch (err) {
      console.error('Error communicating with Ollama:', err)
      alert('Could not rephrase the complaint.')
      return {
        subject: 'Voice Complaint',
        description: inputText,
        priority: 'medium',
        churn_risk: 'medium',
        eta_hours: 24
      }
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    stopRecording()

    const result = await generateRephrasedContent(text)
    setSubject(result.subject)
    setDescription(result.description)
    setPriority(result.priority)
    setChurnRisk(result.churn_risk)
    setEtaHours(result.eta_hours)

    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser()

    if (authError || !user) {
      alert('You must be logged in to submit a complaint.')
      return
    }

    const { error } = await supabase.from('tickets').insert({
      customer_id: user.id,
      subject: result.subject,
      description: result.description,
      priority: result.priority,
      churn_risk: result.churn_risk,
      eta_hours: result.eta_hours,
      status: 'pending'
    })

    if (error) {
      console.error(error)
      alert(error.message)
    } else {
      alert('Ticket submitted successfully!')
      setText('')
    }
  }

  return (
    <div className="container-fluid py-4" style={{ backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      <div className="row justify-content-center">
        <div className="col-12 col-md-10 col-lg-9">
          <div className="card shadow-lg border-0 p-4" style={{ backgroundColor: '#ffffff', borderRadius: '1rem' }}>
            <h3 className="mb-4 fw-semibold text-primary">
              🎙 Voice Complaint
            </h3>

            <div className="d-flex flex-wrap gap-3 mb-4">
              <button className="btn btn-success flex-fill" onClick={startRecording} disabled={recording}>
                <i className="bi bi-mic me-1"></i> Start
              </button>
              <button className="btn btn-secondary flex-fill" onClick={stopRecording} disabled={!recording}>
                <i className="bi bi-stop-circle me-1"></i> Stop
              </button>
            </div>

            <label htmlFor="transcript" className="form-label fw-medium text-muted">
              Transcript
            </label>
            <textarea
              id="transcript"
              className="form-control mb-4"
              rows={5}
              placeholder="Your speech will appear here..."
              value={text}
              onChange={(e) => setText(e.target.value)}
            />

            <button
              className="btn btn-warning w-100 text-dark fw-semibold"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Submit Complaint'}
            </button>

            {subject && (
              <div className="mt-5 p-4 rounded bg-light border">
                <h5 className="mb-3 text-dark">📄 Complaint Summary</h5>
                <p><strong>Subject:</strong> {subject}</p>
                <p><strong>Description:</strong> {description}</p>
                <p><strong>Priority:</strong> <span className="text-capitalize">{priority}</span></p>
                <p><strong>Churn Risk:</strong> <span className="text-capitalize">{churnRisk}</span></p>
                <p><strong>ETA (hours):</strong> {etaHours}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
