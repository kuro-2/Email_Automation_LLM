import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Reply, Forward, Archive, Trash2, Star, Clock, User, Tag, RefreshCw } from 'lucide-react';
import { EmailDataService } from '../../services/emailDataService';
import { ResponseGenerationService } from '../../services/responseGenerationService';
import { ProcessedEmail } from '../../types/email';

const EmailDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [email, setEmail] = useState<ProcessedEmail | null>(null);
  const [loading, setLoading] = useState(true);
  const [aiResponse, setAiResponse] = useState<string>('');
  const [quickResponses, setQuickResponses] = useState<string[]>([]);
  const [generatingResponse, setGeneratingResponse] = useState(false);
  
  const emailService = EmailDataService.getInstance();
  const responseService = new ResponseGenerationService();

  useEffect(() => {
    loadEmailDetail();
  }, [id]);

  const loadEmailDetail = async () => {
    if (!id) {
      navigate('/');
      return;
    }

    try {
      setLoading(true);
      // Ensure emails are loaded
      await emailService.loadEmailsFromCSV('');
      
      const emailData = emailService.getEmailById(id);
      if (!emailData) {
        console.error('Email not found');
        navigate('/');
        return;
      }
      
      setEmail(emailData);
      
      // Generate AI response
      setGeneratingResponse(true);
      const generatedResponse = responseService.generateResponse(emailData);
      const quickResponseOptions = responseService.generateQuickResponses(emailData);
      
      setAiResponse(generatedResponse);
      setQuickResponses(quickResponseOptions);
      
    } catch (error) {
      console.error('Error loading email detail:', error);
      navigate('/');
    } finally {
      setLoading(false);
      setGeneratingResponse(false);
    }
  };

  const handleGenerateNewResponse = async () => {
    if (!email) return;
    
    setGeneratingResponse(true);
    // Simulate some processing time
    setTimeout(() => {
      const newResponse = responseService.generateResponse(email);
      setAiResponse(newResponse);
      setGeneratingResponse(false);
    }, 1500);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Loading email details...</div>
      </div>
    );
  }

  if (!email) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-red-600">Email not found</div>
      </div>
    );
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
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

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4 mb-6">
        <button 
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          onClick={() => navigate('/')}
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Email Detail</h1>
          <p className="text-gray-600">Review and respond to customer communication</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Email Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Email Header */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">{email.sender.name}</h2>
                  <p className="text-sm text-gray-600">{email.sender.email}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getPriorityColor(email.priority)}`}>
                  {email.priority} priority
                </span>
                <button className="p-2 hover:bg-gray-100 rounded-lg">
                  <Star className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="border-b border-gray-200 pb-4 mb-4">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{email.subject}</h3>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  {new Date(email.timestamp).toLocaleString()}
                </div>
                <div className="flex items-center">
                  <Tag className="h-4 w-4 mr-1" />
                  <span className={getSentimentColor(email.sentiment)}>
                    {email.sentiment} sentiment
                  </span>
                </div>
                <span className="text-blue-600">{email.category}</span>
              </div>
            </div>

            <div className="prose max-w-none">
              <div className="whitespace-pre-wrap text-gray-900 leading-relaxed">
                {email.body}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-3 mt-6 pt-6 border-t border-gray-200">
              <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                <Reply className="h-4 w-4 mr-2" />
                Reply
              </button>
              <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                <Forward className="h-4 w-4 mr-2" />
                Forward
              </button>
              <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                <Archive className="h-4 w-4 mr-2" />
                Archive
              </button>
              <button className="flex items-center px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </button>
            </div>
          </div>

          {/* AI-Generated Response */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">AI-Generated Response</h3>
              {generatingResponse && (
                <div className="flex items-center space-x-2 text-blue-600">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Generating...</span>
                </div>
              )}
            </div>
            
            {quickResponses.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Quick Response Suggestions</h4>
                <div className="flex flex-wrap gap-2">
                  {quickResponses.map((response, index) => (
                    <button
                      key={index}
                      onClick={() => setAiResponse(response)}
                      className="px-3 py-1 text-xs bg-blue-50 text-blue-700 rounded-full hover:bg-blue-100 transition-colors"
                    >
                      {response}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <div className="whitespace-pre-wrap text-gray-900 leading-relaxed text-sm">
                {aiResponse || 'Generating response...'}
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                Send Response
              </button>
              <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                Edit Response
              </button>
              <button 
                onClick={handleGenerateNewResponse}
                disabled={generatingResponse}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                {generatingResponse ? 'Generating...' : 'Generate New'}
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar - AI Insights */}
        <div className="space-y-6">
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Insights</h3>
            
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Classification</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Priority:</span>
                    <span className={`text-sm font-medium ${email.priority === 'high' ? 'text-red-600' : 'text-gray-900'}`}>
                      {email.priority}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Sentiment:</span>
                    <span className={`text-sm font-medium ${getSentimentColor(email.sentiment)}`}>
                      {email.sentiment}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Confidence:</span>
                    <span className="text-sm font-medium text-gray-900">
                      {Math.round(email.confidence * 100)}%
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Extracted Information</h4>
                <div className="space-y-2">
                  {Object.entries(email.extractedInfo).map(([key, value]) => (
                    <div key={key} className="flex flex-col">
                      <span className="text-xs text-gray-500 uppercase tracking-wide">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                      <span className="text-sm text-gray-900 font-medium">
                        {Array.isArray(value) ? value.join(', ') : value}
                      </span>
                    </div>
                  ))}
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-500 uppercase tracking-wide">
                      Urgency Score
                    </span>
                    <span className="text-sm text-gray-900 font-medium">
                      {Math.round(email.urgencyScore * 100)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Similar Cases</h3>
            <div className="space-y-3">
              <div className="p-3 border border-gray-200 rounded-lg">
                <p className="text-sm font-medium text-gray-900">{email.category.toLowerCase()} related issue</p>
                <p className="text-xs text-gray-600 mt-1">Similar priority level</p>
              </div>
              <div className="p-3 border border-gray-200 rounded-lg">
                <p className="text-sm font-medium text-gray-900">{email.sentiment} sentiment case</p>
                <p className="text-xs text-gray-600 mt-1">Confidence: {Math.round(email.confidence * 100)}%</p>
              </div>
              <div className="p-3 border border-gray-200 rounded-lg">
                <p className="text-sm font-medium text-gray-900">Recent {email.category} tickets</p>
                <p className="text-xs text-gray-600 mt-1">From {email.sender.email.split('@')[1]}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailDetail;