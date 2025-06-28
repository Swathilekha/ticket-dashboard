import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { supabase } from '../supabase'

export default function List() {
  const [tickets, setTickets] = useState([])
  const [priorityFilter, setPriorityFilter] = useState('')
  const location = useLocation()
  const navigate = useNavigate()

  // On load or URL change
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const p = params.get('priority') || ''
    setPriorityFilter(p)
    fetchTickets(p)
  }, [location.search])

  const fetchTickets = async (priority) => {
    let query = supabase
      .from('tickets')
      .select(`
        id,
        subject,
        description,
        status,
        priority,
        churn_risk,
        eta_hours,
        created_at,
        assigned_agent_id,
        agents (
          name
        )
      `)
      .order('created_at', { ascending: false })

    if (priority) {
      query = query.eq('priority', priority)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching tickets:', error)
      return
    }

    setTickets(data)
  }

  const handlePriorityChange = (e) => {
    const selected = e.target.value
    setPriorityFilter(selected)
    navigate(`/dashboard/list${selected ? `?priority=${selected}` : ''}`)
  }

  return (
    <div>
      <h2>All Tickets</h2>

      <div style={{ marginBottom: '20px' }}>
        <label htmlFor="priority-filter">Filter by Priority: </label>
        <select
          id="priority-filter"
          value={priorityFilter}
          onChange={handlePriorityChange}
          style={{ marginLeft: '10px', padding: '5px' }}
        >
          <option value="">All</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>

      {tickets.length === 0 ? (
        <p>No tickets found.</p>
      ) : (
        <div>
          {tickets.map((ticket) => (
            <div
              key={ticket.id}
              style={{
                border: '1px solid #ccc',
                padding: '15px',
                marginBottom: '10px',
                borderRadius: '8px',
                boxShadow: '2px 2px 6px #eee'
              }}
            >
              <h4>{ticket.subject}</h4>
              <p>{ticket.description}</p>
              <p>Status: <strong>{ticket.status}</strong></p>

              {/* Priority Badge */}
              <span style={{
                display: 'inline-block',
                padding: '5px 10px',
                marginRight: '10px',
                borderRadius: '12px',
                color: '#fff',
                backgroundColor:
                  ticket.priority === 'high'
                    ? '#e53935'
                    : ticket.priority === 'medium'
                    ? '#fb8c00'
                    : '#43a047'
              }}>
                Priority: {ticket.priority}
              </span>

              {/* Churn Risk */}
              <span style={{
                display: 'inline-block',
                padding: '5px 10px',
                marginRight: '10px',
                borderRadius: '12px',
                color: '#fff',
                backgroundColor:
                  ticket.churn_risk === 'high'
                    ? '#b71c1c'
                    : ticket.churn_risk === 'medium'
                    ? '#fbc02d'
                    : '#388e3c'
              }}>
                Churn Risk: {ticket.churn_risk || 'unknown'}
              </span>

              {/* ETA */}
              <span style={{
                display: 'inline-block',
                padding: '5px 10px',
                marginRight: '10px',
                borderRadius: '12px',
                backgroundColor: '#90caf9',
                color: '#0d47a1'
              }}>
                ETA: {ticket.eta_hours || 'N/A'} hours
              </span>

              {/* Agent Name */}
              {ticket.agents?.name && (
                <span style={{
                  display: 'inline-block',
                  padding: '5px 10px',
                  borderRadius: '12px',
                  backgroundColor: '#e1bee7',
                  color: '#6a1b9a'
                }}>
                  Assigned Agent: {ticket.agents.name}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
