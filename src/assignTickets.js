// assignTickets.js
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://aodvyolehfrawijgfcbq.supabase.co',       // Replace with your project URL
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFvZHZ5b2xlaGZyYXdpamdmY2JxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDY2OTIzMywiZXhwIjoyMDY2MjQ1MjMzfQ.G83aesHZ4lv6yCRe6pEymPxw6ZM6eHolKmmgS9po6K8'                   // Use Supabase service key (backend use only!)
)

async function assignTicketsInBatch() {
  // 1. Get unassigned tickets by priority
  const { data: tickets, error: ticketsError } = await supabase
    .from('tickets')
    .select('*')
    .is('assigned_agent_id', null)
    .order('priority', { ascending: false }) // High -> Low
    .order('created_at', { ascending: true })

  if (ticketsError) {
    console.error('Error fetching tickets:', ticketsError)
    return
  }

  // 2. Get agents and count of tickets assigned to each
  const { data: agents, error: agentsError } = await supabase.rpc('get_agents_with_ticket_counts')

  if (agentsError) {
    console.error('Error fetching agents:', agentsError)
    return
  }

  // 3. Assign each ticket to least busy agent
  for (const ticket of tickets) {
    agents.sort((a, b) => a.ticket_count - b.ticket_count)

    const agent = agents[0]
    if (!agent) {
      console.warn('No agents available')
      break
    }

    const { error: assignError } = await supabase
      .from('tickets')
      .update({ assigned_agent_id: agent.id, status: 'assigned' })
      .eq('id', ticket.id)

    if (!assignError) {
      agent.ticket_count += 1
      console.log(`Ticket ${ticket.id} assigned to agent ${agent.name}`)
    }
  }
}

assignTicketsInBatch()
