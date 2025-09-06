import React, { useState, useEffect } from 'react';
import { Mail, Clock, AlertTriangle, CheckCircle, TrendingUp, Users } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { EmailDataService } from '../../services/emailDataService';
import { ProcessedEmail, EmailStats } from '../../types/email';

const Dashboard = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [emailStats, setEmailStats] = useState<EmailStats | null>(null);
  const [recentEmails, setRecentEmails] = useState<ProcessedEmail[]>([]);
  const [loading, setLoading] = useState(true);
  const emailService = EmailDataService.getInstance();

  useEffect(() => {
    loadDashboardData();
  }, []);

  useEffect(() => {
    // If there's a search parameter, redirect to emails page with search
    const searchQuery = searchParams.get('search');
    if (searchQuery) {
      navigate(`/emails?search=${encodeURIComponent(searchQuery)}`);
    }
  }, [searchParams, navigate]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      // Load emails from CSV
      await emailService.loadEmailsFromCSV('');
      
      // Get stats and recent emails
      const stats = emailService.getEmailStats();
      const recent = emailService.getRecentEmails(5);
      
      setEmailStats(stats);
      setRecentEmails(recent);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Loading dashboard data...</div>
      </div>
    );
  }

  if (!emailStats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-red-600">Error loading dashboard data</div>
      </div>
    );
  }

  const stats = [
    { name: 'Total Emails', value: emailStats.totalEmails.toString(), icon: Mail, change: '+12%', changeType: 'positive' as const },
    { name: 'Pending Review', value: emailStats.pendingReview.toString(), icon: Clock, change: '-8%', changeType: 'negative' as const },
    { name: 'High Priority', value: emailStats.highPriority.toString(), icon: AlertTriangle, change: '+3%', changeType: 'positive' as const },
    { name: 'Resolved Today', value: emailStats.resolvedToday.toString(), icon: CheckCircle, change: '+24%', changeType: 'positive' as const },
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'text-green-600';
      case 'negative': return 'text-red-600';
      case 'neutral': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  const getTimeAgo = (timestamp: string): string => {
    const now = new Date();
    const emailDate = new Date(timestamp);
    const diffMs = now.getTime() - emailDate.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 60) {
      return `${diffMins} min ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    }
  };

  const handleEmailClick = (emailId: string) => {
    navigate(`/email/${emailId}`);
  };

  const handleSyncEmails = async () => {
    await loadDashboardData();
  };

  const handleViewAnalytics = () => {
    navigate('/analytics');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Overview of your communication assistant</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <stat.icon className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    {stat.name}
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {stat.value}
                    </div>
                    <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                      stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {stat.change}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Emails */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-medium text-gray-900">Recent Emails</h2>
          <button 
            onClick={() => navigate('/emails')}
            className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
          >
            View All Emails
          </button>
        </div>
        <div className="divide-y divide-gray-200">
          {recentEmails.map((email) => (
            <div 
              key={email.id} 
              className="px-6 py-4 hover:bg-gray-50 cursor-pointer transition-colors"
              onClick={() => handleEmailClick(email.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-3">
                    <h3 className="text-sm font-medium text-gray-900 truncate">
                      {email.subject}
                    </h3>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(email.priority)}`}>
                      {email.priority}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                    <span>{email.sender.email}</span>
                    <span className={getSentimentColor(email.sentiment)}>
                      {email.sentiment}
                    </span>
                    <span>{email.category}</span>
                  </div>
                </div>
                <div className="flex-shrink-0 text-sm text-gray-500">
                  {getTimeAgo(email.timestamp)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button 
            onClick={handleSyncEmails}
            className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Mail className="h-5 w-5 mr-2 text-blue-600" />
            <span className="text-sm font-medium">Sync Emails</span>
          </button>
          <button 
            onClick={handleViewAnalytics}
            className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
            <span className="text-sm font-medium">View Analytics</span>
          </button>
          <button 
            onClick={() => navigate('/settings')}
            className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Users className="h-5 w-5 mr-2 text-purple-600" />
            <span className="text-sm font-medium">Settings</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;