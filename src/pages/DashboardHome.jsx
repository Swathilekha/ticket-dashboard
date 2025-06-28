import { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis
} from 'recharts';

const THEME_COLORS = {
  yellow: '#facc15', // primary
  blue: '#3b82f6',   // secondary
  red: '#ef4444'     // alert
};

const STATUS_COLORS = [THEME_COLORS.yellow, THEME_COLORS.blue];
const PRIORITY_COLORS = [THEME_COLORS.red, THEME_COLORS.blue, THEME_COLORS.yellow];

const weeklyData = [
  { day: 'Mon', created: 12, closed: 8 },
  { day: 'Tue', created: 19, closed: 15 },
  { day: 'Wed', created: 14, closed: 13 },
  { day: 'Thu', created: 17, closed: 12 },
  { day: 'Fri', created: 22, closed: 20 },
  { day: 'Sat', created: 9, closed: 7 },
  { day: 'Sun', created: 5, closed: 3 }
];

export default function DashboardHome() {
  const [ticketCount, setTicketCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [churnCount, setChurnCount] = useState(0);
  const [statusData, setStatusData] = useState([]);
  const [priorityData, setPriorityData] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data: tickets, error } = await supabase.from('tickets').select('*');
    if (!error && tickets) {
      setTicketCount(tickets.length);
      setPendingCount(tickets.filter(t => t.status === 'pending').length);
      setChurnCount(tickets.filter(t => t.churn_risk === 'high').length);

      const statusCount = {
        assigned: tickets.filter(t => t.status === 'assigned').length,
        pending: tickets.filter(t => t.status === 'pending').length,
      };
      const priorityCount = {
        high: tickets.filter(t => t.priority === 'high').length,
        medium: tickets.filter(t => t.priority === 'medium').length,
        low: tickets.filter(t => t.priority === 'low').length,
      };

      setStatusData([
        { name: 'Assigned', value: statusCount.assigned },
        { name: 'Pending', value: statusCount.pending },
      ]);

      setPriorityData([
        { name: 'High', value: priorityCount.high },
        { name: 'Medium', value: priorityCount.medium },
        { name: 'Low', value: priorityCount.low },
      ]);
    }
  };

  return (
    <div className="container-fluid py-4" style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      <h2 className="fw-bold mb-3 text-dark">Welcome to the Ticket Dashboard</h2>
      <p className="text-secondary mb-4">Monitor, prioritize, and analyze customer complaints effectively.</p>

      <div className="row g-4">
        {/* Summary Cards */}
        <div className="col-sm-12 col-md-4">
          <div className="card bg-warning text-dark shadow-sm">
            <div className="card-body text-center">
              <h6 className="fw-bold"><i className="bi bi-ticket-perforated-fill me-1"></i>Total Tickets</h6>
              <h1>{ticketCount}</h1>
            </div>
          </div>
        </div>

        <div className="col-sm-12 col-md-4">
          <div className="card bg-primary text-white shadow-sm">
            <div className="card-body text-center">
              <h6 className="fw-bold"><i className="bi bi-hourglass-split me-1"></i>Pending Tickets</h6>
              <h1>{pendingCount}</h1>
            </div>
          </div>
        </div>

        <div className="col-sm-12 col-md-4">
          <div className="card bg-danger text-white shadow-sm">
            <div className="card-body text-center">
              <h6 className="fw-bold"><i className="bi bi-exclamation-triangle me-1"></i>High Churn Risk</h6>
              <h1>{churnCount}</h1>
            </div>
          </div>
        </div>

        {/* Pie Charts */}
        <div className="col-sm-12 col-md-6">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <h6 className="text-primary fw-bold mb-3"><i className="bi bi-graph-up me-1"></i>Status Overview</h6>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label>
                    {statusData.map((_, i) => (
                      <Cell key={`status-${i}`} fill={STATUS_COLORS[i]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="col-sm-12 col-md-6">
          <div className="card shadow-sm h-100">
            <div className="card-body">
              <h6 className="text-danger fw-bold mb-3"><i className="bi bi-flag-fill me-1"></i>Priority Breakdown</h6>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={priorityData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label>
                    {priorityData.map((_, i) => (
                      <Cell key={`priority-${i}`} fill={PRIORITY_COLORS[i]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Weekly Overview */}
        <div className="col-12">
          <div className="card shadow-sm">
            <div className="card-body">
              <h6 className="fw-bold text-dark mb-3"><i className="bi bi-calendar-week me-1"></i>Weekly Ticket Trends</h6>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={weeklyData}>
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="created" stroke={THEME_COLORS.yellow} name="Created" />
                  <Line type="monotone" dataKey="closed" stroke={THEME_COLORS.blue} name="Closed" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
