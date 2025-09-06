import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, TrendingDown, Mail, Clock, Users, Target } from 'lucide-react';
import { EmailDataService } from '../../services/emailDataService';
import { ProcessedEmail, EmailStats } from '../../types/email';

const Analytics = () => {
  const [emailStats, setEmailStats] = useState<EmailStats | null>(null);
  const [emails, setEmails] = useState<ProcessedEmail[]>([]);
  const [loading, setLoading] = useState(true);
  const emailService = EmailDataService.getInstance();

  useEffect(() => {
    loadAnalyticsData();
  }, []);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      await emailService.loadEmailsFromCSV('');
      
      const stats = emailService.getEmailStats();
      const allEmails = emailService.getAllEmails();
      
      setEmailStats(stats);
      setEmails(allEmails);
    } catch (error) {
      console.error('Error loading analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Loading analytics data...</div>
      </div>
    );
  }

  if (!emailStats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-red-600">Error loading analytics data</div>
      </div>
    );
  }

  // Process email data by date for volume chart
  const emailVolumeData = () => {
    const dailyData: { [date: string]: { emails: number; resolved: number } } = {};
    
    emails.forEach(email => {
      const date = new Date(email.timestamp);
      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
      
      if (!dailyData[dayName]) {
        dailyData[dayName] = { emails: 0, resolved: 0 };
      }
      
      dailyData[dayName].emails++;
      // Simulate resolved emails (80% resolution rate)
      if (Math.random() > 0.2) {
        dailyData[dayName].resolved++;
      }
    });
    
    return Object.entries(dailyData).map(([name, data]) => ({ name, ...data }));
  };

  // Convert stats to chart data
  const sentimentData = [
    { name: 'Positive', value: emailStats.sentimentDistribution.positive, color: '#10B981' },
    { name: 'Neutral', value: emailStats.sentimentDistribution.neutral, color: '#6B7280' },
    { name: 'Negative', value: emailStats.sentimentDistribution.negative, color: '#EF4444' },
  ];

  const responseTimeData = () => {
    // Simulate response time distribution based on priority
    const high = emailStats.priorityDistribution.high;
    const medium = emailStats.priorityDistribution.medium;
    const low = emailStats.priorityDistribution.low;
    
    return [
      { time: '0-1h', count: Math.floor(high * 0.8) }, // High priority resolved quickly
      { time: '1-4h', count: Math.floor(high * 0.2 + medium * 0.6) },
      { time: '4-8h', count: Math.floor(medium * 0.3 + low * 0.4) },
      { time: '8-24h', count: Math.floor(medium * 0.1 + low * 0.5) },
      { time: '24h+', count: Math.floor(low * 0.1) },
    ];
  };

  const categoryData = Object.entries(emailStats.categoryDistribution).map(([category, count]) => ({
    category,
    count,
    trend: count > 10 ? '+12%' : count > 5 ? '+8%' : '+3%'
  }));

  const kpiCards = [
    {
      title: 'Average Response Time',
      value: '2.4 hours',
      change: '-15%',
      changeType: 'positive' as const,
      icon: Clock,
    },
    {
      title: 'Resolution Rate',
      value: '94.2%',
      change: '+3%',
      changeType: 'positive' as const,
      icon: Target,
    },
    {
      title: 'Customer Satisfaction',
      value: '4.7/5',
      change: '+0.2',
      changeType: 'positive' as const,
      icon: Users,
    },
    {
      title: 'Total Emails Processed',
      value: emailStats.totalEmails.toString(),
      change: '+18%',
      changeType: 'positive' as const,
      icon: Mail,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
        <p className="text-gray-600">Insights and performance metrics for your communication assistant</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiCards.map((kpi) => (
          <div key={kpi.title} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <kpi.icon className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    {kpi.title}
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {kpi.value}
                    </div>
                    <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                      kpi.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {kpi.changeType === 'positive' ? (
                        <TrendingUp className="h-4 w-4 mr-1" />
                      ) : (
                        <TrendingDown className="h-4 w-4 mr-1" />
                      )}
                      {kpi.change}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Email Volume Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Email Volume & Resolution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={emailVolumeData()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="emails" fill="#3B82F6" name="Received" />
              <Bar dataKey="resolved" fill="#10B981" name="Resolved" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Sentiment Distribution */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Sentiment Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={sentimentData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {sentimentData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Response Time Distribution */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Response Time Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={responseTimeData()} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="time" type="category" />
              <Tooltip />
              <Bar dataKey="count" fill="#8B5CF6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Category Performance */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Category Performance</h3>
          <div className="space-y-4">
            {categoryData.map((category) => (
              <div key={category.category} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-900">{category.category}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">{category.count}</span>
                  <span className={`text-sm font-medium ${
                    category.trend.startsWith('+') ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {category.trend}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Detailed Metrics Table */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Detailed Performance Metrics</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Metric
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Current Period
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Previous Period
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Change
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  First Response Time
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">1.2 hours</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">1.8 hours</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">-33%</td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Resolution Time
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">4.5 hours</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">6.2 hours</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">-27%</td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  AI Accuracy
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">89.2%</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">85.7%</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">+4%</td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  Total Categories
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{Object.keys(emailStats.categoryDistribution).length}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">5</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">+{Object.keys(emailStats.categoryDistribution).length - 5}</td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  High Priority Emails
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{emailStats.priorityDistribution.high}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{Math.floor(emailStats.priorityDistribution.high * 0.8)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">+{emailStats.priorityDistribution.high - Math.floor(emailStats.priorityDistribution.high * 0.8)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Analytics;