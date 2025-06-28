import { useEffect, useState } from 'react'
import { supabase } from '../supabase'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer
} from 'recharts'

export default function Billing() {
  const [data, setData] = useState([])
  const [hikeReason, setHikeReason] = useState('')

  useEffect(() => {
    const fetchBillingData = async () => {
      const user = await supabase.auth.getUser()
      const userId = user.data?.user?.id

      const { data, error } = await supabase
        .from('monthly_billing_summary')
        .select('*')
        .eq('user_id', userId)
        .order('month', { ascending: true })

      if (!error && data.length >= 6) {
        setData(data)

        const lastSix = data.slice(-6)
        const lastFiveAvg = lastSix.slice(0, 5).reduce((acc, d) => acc + d.total_amount, 0) / 5
        const current = lastSix[5]

        if (current.total_amount > lastFiveAvg) {
          const response = await fetch('http://localhost:11434/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              model: 'llama3',
              prompt: `Here are the past 5 months' bills: ${lastSix
                .slice(0, 5)
                .map(d => d.total_amount)
                .join(', ')}, and the current month is ${current.total_amount}. What could be the reason for the hike in the latest bill?`,
              stream: false
            })
          })
          const result = await response.json()
          setHikeReason(result.response.trim())
        }
      }
    }

    fetchBillingData()
  }, [])

  return (
    <div style={{ padding: '20px' }}>
      <h2 className="mb-4">📊 Monthly Bill Summary</h2>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="total_amount" fill="#82ca9d" />
        </BarChart>
      </ResponsiveContainer>

      {hikeReason && (
        <div
          className="mt-4"
          style={{
            backgroundColor: '#fef3c7',
            border: '1px solid #facc15',
            borderRadius: '6px',
            padding: '1rem',
            marginTop: '1.5rem',
            color: '#78350f',
            fontSize: '0.95rem',
            lineHeight: 1.6,
            whiteSpace: 'pre-wrap'
          }}
        >
          <h4 className="text-danger mb-2">⚠️ Hike Detected</h4>
          {hikeReason}
        </div>
      )}
    </div>
  )
}
