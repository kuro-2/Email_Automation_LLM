import { RawEmailData, ProcessedEmail } from '../types/email';

export class CSVParser {
  static parseCSV(csvText: string): RawEmailData[] {
    const lines = csvText.split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    const emails: RawEmailData[] = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      // Handle CSV parsing with potential commas in quoted fields
      const values = this.parseCSVLine(line);
      
      if (values.length >= 4) {
        emails.push({
          sender: values[0],
          subject: values[1],
          body: values[2],
          sent_date: values[3]
        });
      }
    }

    return emails;
  }

  private static parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const nextChar = line[i + 1];
      
      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          current += '"';
          i++; // Skip next quote
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    result.push(current.trim());
    return result;
  }

  static generateEmailId(sender: string, subject: string, timestamp: string): string {
    const combined = `${sender}-${subject}-${timestamp}`;
    // Simple hash function to generate consistent IDs
    let hash = 0;
    for (let i = 0; i < combined.length; i++) {
      const char = combined.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  static parseSender(senderEmail: string): { name: string; email: string } {
    const email = senderEmail.trim();
    const atIndex = email.indexOf('@');
    
    if (atIndex === -1) {
      return { name: email, email: email };
    }
    
    const username = email.substring(0, atIndex);
    const name = username.split('.').map(part => 
      part.charAt(0).toUpperCase() + part.slice(1)
    ).join(' ');
    
    return { name, email };
  }

  static parseDate(dateString: string): string {
    try {
      // Handle the format "8/19/2025 0:58"
      const date = new Date(dateString);
      return date.toISOString();
    } catch {
      return new Date().toISOString();
    }
  }
}