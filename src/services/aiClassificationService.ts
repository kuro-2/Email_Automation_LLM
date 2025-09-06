export interface EmailClassification {
  priority: 'low' | 'medium' | 'high';
  sentiment: 'positive' | 'negative' | 'neutral';
  category: string;
  confidence: number;
  urgencyScore: number;
}

export class AIClassificationService {
  private urgencyKeywords = [
    'urgent', 'asap', 'critical', 'emergency', 'immediate', 'quickly', 'soon',
    'downtime', 'down', 'broken', 'not working', 'blocked', 'inaccessible'
  ];

  private negativeKeywords = [
    'problem', 'issue', 'error', 'bug', 'broken', 'not working', 'failed', 
    'unable', 'cannot', 'can\'t', 'won\'t', 'doesn\'t', 'trouble', 'difficulty',
    'frustrated', 'disappointed', 'angry', 'upset', 'terrible', 'awful'
  ];

  private positiveKeywords = [
    'thank', 'thanks', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic',
    'perfect', 'love', 'appreciate', 'satisfied', 'happy', 'pleased', 'good'
  ];

  private categoryKeywords = {
    'Support': ['help', 'support', 'assist', 'issue', 'problem', 'trouble', 'error', 'bug'],
    'Billing': ['billing', 'payment', 'invoice', 'charge', 'refund', 'subscription', 'price', 'cost'],
    'Technical': ['technical', 'server', 'system', 'api', 'integration', 'code', 'software'],
    'Sales': ['sales', 'pricing', 'quote', 'demo', 'purchase', 'buy', 'subscription'],
    'Account': ['account', 'login', 'password', 'access', 'verification', 'profile'],
    'General': ['question', 'query', 'information', 'clarification']
  };

  async classifyEmail(subject: string, body: string): Promise<EmailClassification> {
    const text = `${subject} ${body}`.toLowerCase();
    
    const urgencyScore = this.calculateUrgencyScore(text);
    const priority = this.determinePriority(urgencyScore, subject, body);
    const sentiment = this.analyzeSentiment(text);
    const category = this.categorizeEmail(text);
    const confidence = this.calculateConfidence(text, priority, sentiment, category);

    return {
      priority,
      sentiment,
      category,
      confidence,
      urgencyScore
    };
  }

  private calculateUrgencyScore(text: string): number {
    let score = 0;
    const words = text.split(/\s+/);
    
    for (const word of words) {
      if (this.urgencyKeywords.some(keyword => word.includes(keyword))) {
        score += 1;
      }
    }
    
    // Check for urgent indicators in subject
    if (text.includes('urgent') || text.includes('critical') || text.includes('emergency')) {
      score += 2;
    }
    
    // Check for time-sensitive language
    if (text.includes('immediately') || text.includes('asap') || text.includes('right away')) {
      score += 1.5;
    }
    
    return Math.min(score / 3, 1); // Normalize to 0-1
  }

  private determinePriority(urgencyScore: number, subject: string, body: string): 'low' | 'medium' | 'high' {
    const subjectLower = subject.toLowerCase();
    const bodyLower = body.toLowerCase();
    
    // High priority indicators
    if (urgencyScore > 0.7 || 
        subjectLower.includes('urgent') || 
        subjectLower.includes('critical') ||
        subjectLower.includes('emergency') ||
        bodyLower.includes('down') ||
        bodyLower.includes('not working') ||
        bodyLower.includes('completely inaccessible')) {
      return 'high';
    }
    
    // Medium priority indicators
    if (urgencyScore > 0.3 || 
        subjectLower.includes('help') ||
        subjectLower.includes('support') ||
        bodyLower.includes('issue') ||
        bodyLower.includes('problem')) {
      return 'medium';
    }
    
    return 'low';
  }

  private analyzeSentiment(text: string): 'positive' | 'negative' | 'neutral' {
    let positiveScore = 0;
    let negativeScore = 0;
    
    const words = text.split(/\s+/);
    
    for (const word of words) {
      if (this.positiveKeywords.some(keyword => word.includes(keyword))) {
        positiveScore++;
      }
      if (this.negativeKeywords.some(keyword => word.includes(keyword))) {
        negativeScore++;
      }
    }
    
    const sentimentDifference = positiveScore - negativeScore;
    
    if (sentimentDifference > 0) {
      return 'positive';
    } else if (sentimentDifference < 0) {
      return 'negative';
    }
    
    return 'neutral';
  }

  private categorizeEmail(text: string): string {
    let bestCategory = 'General';
    let highestScore = 0;
    
    for (const [category, keywords] of Object.entries(this.categoryKeywords)) {
      let score = 0;
      for (const keyword of keywords) {
        if (text.includes(keyword)) {
          score++;
        }
      }
      
      if (score > highestScore) {
        highestScore = score;
        bestCategory = category;
      }
    }
    
    return bestCategory;
  }

  private calculateConfidence(text: string, priority: string, sentiment: string, category: string): number {
    let confidence = 0.6; // Base confidence
    
    // Increase confidence based on keyword matches
    const totalWords = text.split(/\s+/).length;
    const keywordMatches = this.countKeywordMatches(text);
    
    confidence += (keywordMatches / totalWords) * 0.3;
    
    // Adjust based on text length (longer text = more context = higher confidence)
    if (totalWords > 20) {
      confidence += 0.1;
    }
    
    return Math.min(confidence, 1);
  }

  private countKeywordMatches(text: string): number {
    let matches = 0;
    const allKeywords = [
      ...this.urgencyKeywords,
      ...this.positiveKeywords,
      ...this.negativeKeywords,
      ...Object.values(this.categoryKeywords).flat()
    ];
    
    for (const keyword of allKeywords) {
      if (text.includes(keyword)) {
        matches++;
      }
    }
    
    return matches;
  }

  extractInformation(subject: string, body: string): { [key: string]: string | string[] } {
    const text = `${subject} ${body}`;
    const extracted: { [key: string]: string | string[] } = {};
    
    // Extract email addresses
    const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const emails = text.match(emailPattern) || [];
    if (emails.length > 0) {
      extracted.emailAddresses = emails;
    }
    
    // Extract account IDs
    const accountPattern = /ACC-\w+|account[:\s]+([A-Z0-9-]+)/gi;
    const accounts = text.match(accountPattern) || [];
    if (accounts.length > 0) {
      extracted.accountIds = accounts;
    }
    
    // Extract transaction IDs
    const transactionPattern = /TXN-\w+|transaction[:\s]+([A-Z0-9-]+)/gi;
    const transactions = text.match(transactionPattern) || [];
    if (transactions.length > 0) {
      extracted.transactionIds = transactions;
    }
    
    // Extract phone numbers
    const phonePattern = /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g;
    const phones = text.match(phonePattern) || [];
    if (phones.length > 0) {
      extracted.phoneNumbers = phones;
    }
    
    // Determine issue type based on content
    if (text.toLowerCase().includes('login') || text.toLowerCase().includes('password')) {
      extracted.issueType = 'Authentication';
    } else if (text.toLowerCase().includes('billing') || text.toLowerCase().includes('payment')) {
      extracted.issueType = 'Billing';
    } else if (text.toLowerCase().includes('api') || text.toLowerCase().includes('integration')) {
      extracted.issueType = 'Technical Integration';
    } else if (text.toLowerCase().includes('verification')) {
      extracted.issueType = 'Account Verification';
    } else {
      extracted.issueType = 'General Support';
    }
    
    return extracted;
  }
}