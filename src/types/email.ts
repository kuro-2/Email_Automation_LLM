export interface RawEmailData {
  sender: string;
  subject: string;
  body: string;
  sent_date: string;
}

export interface ProcessedEmail {
  id: string;
  sender: {
    name: string;
    email: string;
  };
  subject: string;
  body: string;
  timestamp: string;
  priority: 'low' | 'medium' | 'high';
  sentiment: 'positive' | 'negative' | 'neutral';
  category: string;
  confidence: number;
  urgencyScore: number;
  extractedInfo: {
    [key: string]: string | string[];
  };
}

export interface EmailStats {
  totalEmails: number;
  pendingReview: number;
  highPriority: number;
  resolvedToday: number;
  sentimentDistribution: {
    positive: number;
    negative: number;
    neutral: number;
  };
  categoryDistribution: {
    [category: string]: number;
  };
  priorityDistribution: {
    high: number;
    medium: number;
    low: number;
  };
}

export interface SearchFilters {
  query?: string;
  sender?: string;
  priority?: string;
  sentiment?: string;
  category?: string;
  dateRange?: {
    start: string;
    end: string;
  };
}