import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, Filter, SortAsc, SortDesc, Search } from 'lucide-react';
import { EmailDataService } from '../../services/emailDataService';
import { ProcessedEmail, SearchFilters } from '../../types/email';

const EmailList = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [emails, setEmails] = useState<ProcessedEmail[]>([]);
  const [filteredEmails, setFilteredEmails] = useState<ProcessedEmail[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<SearchFilters>({});
  const [sortBy, setSortBy] = useState<'timestamp' | 'priority' | 'sender'>('timestamp');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showFilters, setShowFilters] = useState(false);
  
  const emailService = EmailDataService.getInstance();

  useEffect(() => {
    loadEmails();
  }, []);

  useEffect(() => {
    // Handle search query from URL
    const searchQuery = searchParams.get('search');
    if (searchQuery) {
      setFilters(prev => ({ ...prev, query: searchQuery }));
    }
  }, [searchParams]);

  useEffect(() => {
    applyFiltersAndSort();
  }, [emails, filters, sortBy, sortOrder]);

  const loadEmails = async () => {
    try {
      setLoading(true);
      await emailService.loadEmailsFromCSV('');
      const allEmails = emailService.getAllEmails();
      setEmails(allEmails);
    } catch (error) {
      console.error('Error loading emails:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFiltersAndSort = () => {
    let filtered = emailService.searchEmails(filters);
    
    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'timestamp':
          comparison = new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
          break;
        case 'priority':
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          comparison = priorityOrder[a.priority] - priorityOrder[b.priority];
          break;
        case 'sender':
          comparison = a.sender.name.localeCompare(b.sender.name);
          break;
      }
      
      return sortOrder === 'desc' ? -comparison : comparison;
    });
    
    setFilteredEmails(filtered);
  };

  const handleFilterChange = (key: keyof SearchFilters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value || undefined
    }));
  };

  const clearFilters = () => {
    setFilters({});
    navigate('/emails');
  };

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

  const toggleSort = (field: typeof sortBy) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Loading emails...</div>
      </div>
    );
  }

  const uniqueCategories = [...new Set(emails.map(email => email.category))];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Email Inbox</h1>
          <p className="text-gray-600">{filteredEmails.length} of {emails.length} emails</p>
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <Filter className="h-4 w-4 mr-2" />
          Filters
        </button>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <input
                type="text"
                value={filters.query || ''}
                onChange={(e) => handleFilterChange('query', e.target.value)}
                placeholder="Search emails..."
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select
                value={filters.priority || ''}
                onChange={(e) => handleFilterChange('priority', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All priorities</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sentiment</label>
              <select
                value={filters.sentiment || ''}
                onChange={(e) => handleFilterChange('sentiment', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All sentiments</option>
                <option value="positive">Positive</option>
                <option value="negative">Negative</option>
                <option value="neutral">Neutral</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={filters.category || ''}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All categories</option>
                {uniqueCategories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex justify-end">
            <button
              onClick={clearFilters}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>
      )}

      {/* Sort Controls */}
      <div className="flex items-center space-x-4 bg-white border border-gray-200 rounded-lg p-4">
        <span className="text-sm font-medium text-gray-700">Sort by:</span>
        <button
          onClick={() => toggleSort('timestamp')}
          className={`flex items-center px-3 py-1 rounded text-sm transition-colors ${
            sortBy === 'timestamp' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Date
          {sortBy === 'timestamp' && (
            sortOrder === 'desc' ? <SortDesc className="h-3 w-3 ml-1" /> : <SortAsc className="h-3 w-3 ml-1" />
          )}
        </button>
        <button
          onClick={() => toggleSort('priority')}
          className={`flex items-center px-3 py-1 rounded text-sm transition-colors ${
            sortBy === 'priority' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Priority
          {sortBy === 'priority' && (
            sortOrder === 'desc' ? <SortDesc className="h-3 w-3 ml-1" /> : <SortAsc className="h-3 w-3 ml-1" />
          )}
        </button>
        <button
          onClick={() => toggleSort('sender')}
          className={`flex items-center px-3 py-1 rounded text-sm transition-colors ${
            sortBy === 'sender' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Sender
          {sortBy === 'sender' && (
            sortOrder === 'desc' ? <SortDesc className="h-3 w-3 ml-1" /> : <SortAsc className="h-3 w-3 ml-1" />
          )}
        </button>
      </div>

      {/* Email List */}
      <div className="bg-white shadow rounded-lg">
        <div className="divide-y divide-gray-200">
          {filteredEmails.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No emails found</h3>
              <p className="text-gray-600">Try adjusting your search criteria or filters.</p>
            </div>
          ) : (
            filteredEmails.map((email) => (
              <div
                key={email.id}
                className="px-6 py-4 hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => handleEmailClick(email.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3 mb-1">
                      <h3 className="text-sm font-medium text-gray-900 truncate">{email.subject}</h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(email.priority)}`}>
                        {email.priority}
                      </span>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-500 mb-2">
                      <span>{email.sender.name} ({email.sender.email})</span>
                      <span className={getSentimentColor(email.sentiment)}>{email.sentiment}</span>
                      <span>{email.category}</span>
                      <span>Confidence: {Math.round(email.confidence * 100)}%</span>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">{email.body.substring(0, 150)}...</p>
                  </div>
                  <div className="flex-shrink-0 text-sm text-gray-500">
                    {getTimeAgo(email.timestamp)}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default EmailList;