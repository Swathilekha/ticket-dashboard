import { useState } from 'react';
import { supabase } from '../supabase';

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [context, setContext] = useState('');

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { sender: 'You', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');

    try {
      const newContext = context + `User: ${input}\n`;
      setContext(newContext);

      const res = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'mistral',
          prompt: `
You are a support assistant. Your job is to gather enough information from the user about their complaint.
Once enough info is collected, respond in this format ONLY:

SUBJECT: <short title>
DESCRIPTION: <detailed explanation>
PRIORITY: <high | medium | low>
CHURN RISK: <high | medium | low>
ETA: <number of hours>
RESPONSE: An agent will be assigned to you shortly.

Context so far:
${newContext}
`,
          stream: false
        })
      });

      const data = await res.json();
      const botText = data.response;

      setMessages(prev => [...prev, { sender: 'Bot', text: botText }]);

      const subjectMatch = botText.match(/SUBJECT:\s*(.+)/i);
      const descMatch = botText.match(/DESCRIPTION:\s*([\s\S]+?)PRIORITY:/i);
      const priorityMatch = botText.match(/PRIORITY:\s*(high|medium|low)/i);
      const churnMatch = botText.match(/CHURN RISK:\s*(high|medium|low)/i);
      const etaMatch = botText.match(/ETA:\s*(\d+)/i);

      if (subjectMatch && descMatch && priorityMatch && churnMatch && etaMatch) {
        const subject = subjectMatch[1].trim();
        const description = descMatch[1].trim();
        const priority = priorityMatch[1].trim().toLowerCase();
        const churn_risk = churnMatch[1].trim().toLowerCase();
        const eta_hours = parseInt(etaMatch[1]);

        const { data: userData, error: authError } = await supabase.auth.getUser();
        if (authError || !userData?.user?.id) {
          alert('You must be logged in to submit a ticket.');
          return;
        }

        const customer_id = userData.user.id;

        const { error } = await supabase.from('tickets').insert({
          customer_id,
          subject,
          description,
          priority,
          churn_risk,
          eta_hours,
          status: 'pending'
        });

        if (error) {
          setMessages(prev => [...prev, { sender: 'Bot ❌', text: '❌ Failed to create ticket: ' + error.message }]);
        } else {
          setMessages(prev => [
            ...prev,
            {
              sender: 'Bot ✅',
              text: `✅ Ticket Created\nPriority: ${priority}\nChurn Risk: ${churn_risk}\nETA: ${eta_hours} hrs.`
            }
          ]);
        }
      }
    } catch (err) {
      console.error('Chat error:', err);
      setMessages(prev => [
        ...prev,
        { sender: 'Bot ❌', text: '❌ Error while processing your request.' }
      ]);
    }
  };

  return (
    <div className="d-flex flex-column align-items-center py-4" style={{ minHeight: '100vh', background: '#f8f9fa' }}>
      <div className="w-100" style={{ maxWidth: '600px' }}>
        <h3 className="fw-bold text-primary mb-3 text-center">💬 Support Chat</h3>

        {/* Chat Box */}
        <div
          className="border rounded shadow-sm p-3 mb-3 bg-white"
          style={{ height: '320px', overflowY: 'auto' }}
        >
          {messages.length === 0 ? (
            <p className="text-muted">Start typing your issue and hit Send...</p>
          ) : (
            messages.map((msg, i) => (
              <div
                key={i}
                className={`p-2 mb-2 rounded ${msg.sender.startsWith('Bot') ? 'bg-light text-primary' : 'bg-body'}`}
                style={{ whiteSpace: 'pre-line' }}
              >
                <strong>{msg.sender}:</strong> {msg.text}
              </div>
            ))
          )}
        </div>

        {/* Input and Button */}
        <div className="d-flex">
          <input
            type="text"
            className="form-control me-2"
            placeholder="Type your issue here..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
          />
          <button
            className="btn btn-warning fw-semibold"
            onClick={handleSend}
          >
            Send
          </button>
        </div>
      </div>

      {/* Mobile Responsiveness */}
      <style>{`
        @media (max-width: 576px) {
          .d-flex {
            flex-direction: column;
          }
          .form-control {
            margin-bottom: 0.5rem;
          }
          .btn {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
