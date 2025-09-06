import { ProcessedEmail } from '../types/email';

export class ResponseGenerationService {
  private templates = {
    'Authentication': {
      'high': `Dear {customerName},

Thank you for reaching out regarding the login issues with your account. I understand how frustrating this must be, especially when you need immediate access to your account.

I've immediately escalated your case to our technical team and flagged it as high priority. Here's what we're doing to resolve this:

1. Investigating the specific authentication error you're experiencing
2. Checking for any system-wide issues that might be affecting account access
3. Our technical team will review your account within the next 30 minutes

As an immediate workaround, please try:
- Clearing your browser cache and cookies
- Using an incognito/private browser window
- Trying a different browser or device

I'll personally monitor this case and provide you with an update within the hour. If you need immediate assistance, please call our priority support line and reference case #{caseId}.

Thank you for your patience as we work to resolve this quickly.

Best regards,
{agentName}
Senior Support Specialist`,

      'medium': `Dear {customerName},

Thank you for contacting us about the login issues you're experiencing. I apologize for the inconvenience this has caused.

I've reviewed your account and will work to resolve this issue promptly. Here are some initial troubleshooting steps that often resolve login problems:

1. Reset your password using the "Forgot Password" link
2. Ensure your browser is updated to the latest version
3. Disable any browser extensions that might interfere
4. Try accessing your account from a different device

If these steps don't resolve the issue, I'll investigate further and have a solution for you within 4-6 hours.

Please let me know if you continue experiencing problems.

Best regards,
{agentName}
Support Specialist`,

      'low': `Hello {customerName},

Thanks for reaching out about your login concerns.

To help resolve this, please try the following steps:
1. Reset your password
2. Clear your browser cache
3. Try a different browser

If you continue having issues, please reply with more details and I'll assist further.

Best regards,
{agentName}`
    },

    'Billing': {
      'high': `Dear {customerName},

Thank you for bringing this billing issue to our attention. I understand how concerning billing discrepancies can be, and I want to assure you that we take these matters very seriously.

I've immediately reviewed your account and can see the duplicate charge you mentioned. Here's what I'm doing right now:

1. Initiating a refund for the duplicate charge - this will be processed within 24 hours
2. Adding a credit to your account as a courtesy for the inconvenience
3. Implementing safeguards to prevent this from happening again

The refund of {amount} will appear in your account within 3-5 business days. I've also added a {creditAmount} credit to your account that you can use for future services.

I sincerely apologize for this error and any stress it may have caused. Please don't hesitate to reach out if you have any other concerns.

Best regards,
{agentName}
Senior Billing Specialist`,

      'medium': `Dear {customerName},

Thank you for contacting us regarding your billing inquiry.

I've reviewed your account and understand your concerns about the recent charges. Let me provide you with a clear breakdown:

- {billingDetails}

I'll investigate this further and provide you with a detailed explanation within 24 hours. If there's indeed an error, we'll correct it immediately and issue any necessary refunds.

Thank you for bringing this to our attention.

Best regards,
{agentName}
Billing Support`,

      'low': `Hello {customerName},

Thanks for your billing question.

I'll review your account details and get back to you with clarification within 2 business days.

If you need immediate assistance, please call our billing department.

Best regards,
{agentName}`
    },

    'Technical Integration': {
      'high': `Dear {customerName},

Thank you for reaching out about the API integration issues. I understand this is impacting your operations, and we're treating this as a critical priority.

I've immediately assigned our senior developer to investigate the API connectivity problems you're experiencing. Here's our immediate action plan:

1. Checking API endpoint status and rate limits
2. Reviewing your API key permissions and configuration
3. Testing the specific integration endpoints you mentioned

Our preliminary investigation suggests this might be related to a recent update. We'll have a fix deployed within the next 2 hours.

As an immediate workaround:
- Please try using API version 2.1 instead of 3.0
- Ensure your requests include the proper authentication headers
- Check if you're hitting rate limits (limit is 1000 requests/hour)

I'll update you every 30 minutes until this is resolved. You can also monitor our status page at status.ourcompany.com.

Best regards,
{agentName}
Senior Technical Support Engineer`,

      'medium': `Dear {customerName},

Thanks for your question about API integration capabilities.

Based on your requirements for CRM integration, I'm happy to confirm that we do support third-party API integrations. Here's what we offer:

1. RESTful API with comprehensive documentation
2. Webhook support for real-time updates  
3. SDKs available for popular programming languages
4. Dedicated integration support team

I'll send you our API documentation and integration guide within the next few hours. Our technical team can also schedule a consultation call to discuss your specific CRM integration needs.

Would you prefer to start with our self-service documentation or schedule a technical consultation?

Best regards,
{agentName}
Integration Specialist`,

      'low': `Hello {customerName},

Thanks for your interest in our API capabilities.

I'll send you our integration documentation and have someone from our technical team follow up within 2-3 business days.

Best regards,
{agentName}`
    },

    'Account Verification': {
      'high': `Dear {customerName},

I sincerely apologize that you haven't received your account verification email. I understand how important it is to get your account verified quickly.

I've immediately taken the following actions:

1. Manually verified your account - you should now have full access
2. Investigated why the verification email wasn't delivered
3. Updated your email preferences to ensure future communications reach you

Your account is now fully activated and ready to use. I've also sent a welcome email with important account information.

The issue was caused by our email filters incorrectly categorizing verification emails. We've fixed this system-wide to prevent it from affecting other customers.

Please try logging in now, and let me know if you encounter any other issues.

Welcome aboard!

Best regards,
{agentName}
Customer Success Manager`,

      'medium': `Dear {customerName},

Thank you for reaching out about the missing verification email.

I've resent the verification email to your address. Please check your spam/junk folder as well, as verification emails sometimes end up there.

If you don't receive it within the next 30 minutes, I can manually verify your account. Just reply to this email and I'll take care of it immediately.

Best regards,
{agentName}
Account Specialist`,

      'low': `Hello {customerName},

I've resent your verification email. Please check your inbox and spam folder.

If you don't receive it within 24 hours, please reply and we'll assist further.

Best regards,
{agentName}`
    },

    'General Support': {
      'high': `Dear {customerName},

Thank you for contacting us. I can see this is an urgent matter, and I want to assure you that we're giving it our immediate attention.

I've escalated your request to our senior support team and flagged it as high priority. We'll have someone working on this right away and will provide you with an update within the next hour.

In the meantime, if you have any additional information that might help us resolve this faster, please don't hesitate to share it.

Thank you for your patience as we work to resolve this quickly.

Best regards,
{agentName}
Senior Support Specialist`,

      'medium': `Dear {customerName},

Thank you for reaching out to us.

I've reviewed your request and will make sure you get the assistance you need. I'll investigate this matter and provide you with a comprehensive response within 24 hours.

If you have any additional questions in the meantime, please don't hesitate to reach out.

Best regards,
{agentName}
Support Specialist`,

      'low': `Hello {customerName},

Thanks for contacting us.

I'll review your request and get back to you within 2-3 business days with the information you need.

Best regards,
{agentName}`
    }
  };

  generateResponse(email: ProcessedEmail): string {
    const issueType = email.extractedInfo.issueType as string || 'General Support';
    const priority = email.priority;
    
    // Get the appropriate template
    const categoryTemplates = this.templates[issueType as keyof typeof this.templates] || this.templates['General Support'];
    const template = categoryTemplates[priority];
    
    // Extract customer name from email
    const customerName = email.sender.name || 'Valued Customer';
    
    // Generate case ID
    const caseId = `CASE-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    
    // Generate agent name (you could randomize this or use actual agent names)
    const agentNames = [
      'Sarah Johnson', 'Michael Chen', 'Emily Rodriguez', 'David Kim', 'Jessica Taylor'
    ];
    const agentName = agentNames[Math.floor(Math.random() * agentNames.length)];
    
    // Replace placeholders in template
    let response = template
      .replace(/{customerName}/g, customerName)
      .replace(/{caseId}/g, caseId)
      .replace(/{agentName}/g, agentName)
      .replace(/{amount}/g, '$99.99') // Default amount, could be extracted
      .replace(/{creditAmount}/g, '$20.00') // Default credit
      .replace(/{billingDetails}/g, 'Recent subscription renewal charge');
    
    return response;
  }

  generateQuickResponses(email: ProcessedEmail): string[] {
    const priority = email.priority;
    const issueType = email.extractedInfo.issueType as string;
    
    const quickResponses = [];
    
    // Priority-based responses
    if (priority === 'high') {
      quickResponses.push("I understand this is urgent. Let me escalate this immediately.");
      quickResponses.push("I'm treating this as a high priority and will resolve it within the hour.");
    } else if (priority === 'medium') {
      quickResponses.push("Thank you for reaching out. I'll look into this for you.");
      quickResponses.push("I've received your request and will respond within 24 hours.");
    }
    
    // Issue-type specific responses
    if (issueType?.includes('Authentication')) {
      quickResponses.push("I can help you with your login issues right away.");
      quickResponses.push("Let me reset your password and get you back in.");
    } else if (issueType?.includes('Billing')) {
      quickResponses.push("I'll review your billing details and clarify any charges.");
      quickResponses.push("Let me investigate this billing issue for you.");
    } else if (issueType?.includes('Technical')) {
      quickResponses.push("I'll connect you with our technical team immediately.");
      quickResponses.push("Let me check our API status and integration documentation.");
    }
    
    // General helpful responses
    quickResponses.push("Thank you for contacting us. How can I assist you today?");
    quickResponses.push("I'm here to help resolve this issue for you.");
    
    return quickResponses.slice(0, 3); // Return top 3 suggestions
  }
}