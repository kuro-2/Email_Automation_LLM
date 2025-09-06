import { RawEmailData, ProcessedEmail, EmailStats, SearchFilters } from '../types/email';
import { CSVParser } from '../utils/csvParser';
import { AIClassificationService } from './aiClassificationService';

export class EmailDataService {
  private static instance: EmailDataService;
  private emails: ProcessedEmail[] = [];
  private aiService: AIClassificationService;
  
  private constructor() {
    this.aiService = new AIClassificationService();
  }

  static getInstance(): EmailDataService {
    if (!EmailDataService.instance) {
      EmailDataService.instance = new EmailDataService();
    }
    return EmailDataService.instance;
  }

  async loadEmailsFromCSV(csvFilePath: string): Promise<ProcessedEmail[]> {
    try {
      // In a real app, you'd fetch the CSV file
      // For now, we'll simulate loading the data
      const csvData = await this.loadCSVFile(csvFilePath);
      const rawEmails = CSVParser.parseCSV(csvData);
      
      this.emails = await this.processEmails(rawEmails);
      return this.emails;
    } catch (error) {
      console.error('Error loading emails:', error);
      return [];
    }
  }

  private async loadCSVFile(filePath: string): Promise<string> {
    // In a browser environment, we'll need to handle file loading differently
    // For now, return the sample data from your CSV
    return `sender,subject,body,sent_date
eve@startup.io,Help required with account verification,"Do you support integration with third-party APIs? Specifically, I'm looking for CRM integration options.",8/19/2025 0:58
diana@client.co,General query about subscription,"Hi team, I am unable to log into my account since yesterday. Could you please help me resolve this issue?",8/25/2025 0:58
eve@startup.io,Immediate support needed for billing error,"Hello, I wanted to understand the pricing tiers better. Could you share a detailed breakdown?",8/20/2025 12:58
alice@example.com,Urgent request: system access blocked,"Hi team, I am unable to log into my account since yesterday. Could you please help me resolve this issue?",8/21/2025 21:58
eve@startup.io,Question: integration with API,"Despite multiple attempts, I cannot reset my password. The reset link doesn't seem to work.",8/20/2025 4:58
alice@example.com,Critical help needed for downtime,"Hi team, I am unable to log into my account since yesterday. Could you please help me resolve this issue?",8/18/2025 8:58
diana@client.co,Help required with account verification,There is a billing error where I was charged twice. This needs immediate correction.,8/20/2025 19:58
diana@client.co,Support needed for login issue,I am facing issues with verifying my account. The verification email never arrived. Can you assist?,8/23/2025 6:58
alice@example.com,General query about subscription,"Our servers are down, and we need immediate support. This is highly critical.",8/26/2025 2:58
alice@example.com,Help required with account verification,"Do you support integration with third-party APIs? Specifically, I'm looking for CRM integration options.",8/21/2025 13:58
diana@client.co,Support needed for login issue,"Hi team, I am unable to log into my account since yesterday. Could you please help me resolve this issue?",8/26/2025 15:58
alice@example.com,Help required with account verification,"Do you support integration with third-party APIs? Specifically, I'm looking for CRM integration options.",8/24/2025 5:58
eve@startup.io,Critical help needed for downtime,"Our servers are down, and we need immediate support. This is highly critical.",8/21/2025 19:58
alice@example.com,Query about product pricing,There is a billing error where I was charged twice. This needs immediate correction.,8/24/2025 13:58
alice@example.com,General query about subscription,I am facing issues with verifying my account. The verification email never arrived. Can you assist?,8/26/2025 1:58
alice@example.com,Immediate support needed for billing error,"Despite multiple attempts, I cannot reset my password. The reset link doesn't seem to work.",8/19/2025 7:58
charlie@partner.org,Help required with account verification,"This is urgent – our system is completely inaccessible, and this is affecting our operations.",8/18/2025 0:58
diana@client.co,Request for refund process clarification,Could you clarify the steps involved in requesting a refund? I submitted one last week but have no update.,8/22/2025 17:58
eve@startup.io,Query about product pricing,"Our servers are down, and we need immediate support. This is highly critical.",8/22/2025 9:58
bob@customer.com,Urgent request: system access blocked,"Despite multiple attempts, I cannot reset my password. The reset link doesn't seem to work.",8/19/2025 13:58`;
  }

  private async processEmails(rawEmails: RawEmailData[]): Promise<ProcessedEmail[]> {
    const processedEmails: ProcessedEmail[] = [];

    for (const rawEmail of rawEmails) {
      const id = CSVParser.generateEmailId(rawEmail.sender, rawEmail.subject, rawEmail.sent_date);
      const sender = CSVParser.parseSender(rawEmail.sender);
      const timestamp = CSVParser.parseDate(rawEmail.sent_date);

      // Apply AI classification
      const classification = await this.aiService.classifyEmail(rawEmail.subject, rawEmail.body);
      const extractedInfo = this.aiService.extractInformation(rawEmail.subject, rawEmail.body);

      processedEmails.push({
        id,
        sender,
        subject: rawEmail.subject,
        body: rawEmail.body,
        timestamp,
        priority: classification.priority,
        sentiment: classification.sentiment,
        category: classification.category,
        confidence: classification.confidence,
        urgencyScore: classification.urgencyScore,
        extractedInfo
      });
    }

    return processedEmails;
  }

  getAllEmails(): ProcessedEmail[] {
    return this.emails;
  }

  getEmailById(id: string): ProcessedEmail | undefined {
    return this.emails.find(email => email.id === id);
  }

  searchEmails(filters: SearchFilters): ProcessedEmail[] {
    let filtered = [...this.emails];

    if (filters.query) {
      const query = filters.query.toLowerCase();
      filtered = filtered.filter(email =>
        email.subject.toLowerCase().includes(query) ||
        email.body.toLowerCase().includes(query) ||
        email.sender.email.toLowerCase().includes(query) ||
        email.sender.name.toLowerCase().includes(query)
      );
    }

    if (filters.sender) {
      filtered = filtered.filter(email =>
        email.sender.email.toLowerCase().includes(filters.sender!.toLowerCase()) ||
        email.sender.name.toLowerCase().includes(filters.sender!.toLowerCase())
      );
    }

    if (filters.priority) {
      filtered = filtered.filter(email => email.priority === filters.priority);
    }

    if (filters.sentiment) {
      filtered = filtered.filter(email => email.sentiment === filters.sentiment);
    }

    if (filters.category) {
      filtered = filtered.filter(email => email.category === filters.category);
    }

    if (filters.dateRange) {
      filtered = filtered.filter(email => {
        const emailDate = new Date(email.timestamp);
        const startDate = new Date(filters.dateRange!.start);
        const endDate = new Date(filters.dateRange!.end);
        return emailDate >= startDate && emailDate <= endDate;
      });
    }

    return filtered;
  }

  getEmailStats(): EmailStats {
    const total = this.emails.length;
    const highPriority = this.emails.filter(e => e.priority === 'high').length;
    const pending = this.emails.filter(e => e.priority !== 'low').length;
    
    // Calculate sentiment distribution
    const sentimentCounts = this.emails.reduce((acc, email) => {
      acc[email.sentiment] = (acc[email.sentiment] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Calculate category distribution
    const categoryDistribution = this.emails.reduce((acc, email) => {
      acc[email.category] = (acc[email.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Calculate priority distribution
    const priorityCounts = this.emails.reduce((acc, email) => {
      acc[email.priority] = (acc[email.priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalEmails: total,
      pendingReview: pending,
      highPriority,
      resolvedToday: Math.floor(total * 0.6), // Simulate resolved emails
      sentimentDistribution: {
        positive: sentimentCounts.positive || 0,
        negative: sentimentCounts.negative || 0,
        neutral: sentimentCounts.neutral || 0
      },
      categoryDistribution,
      priorityDistribution: {
        high: priorityCounts.high || 0,
        medium: priorityCounts.medium || 0,
        low: priorityCounts.low || 0
      }
    };
  }

  getRecentEmails(limit: number = 10): ProcessedEmail[] {
    return this.emails
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }
}