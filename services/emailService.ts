import { QuoteData } from '../types';

export const sendQuoteEmail = async (email: string, data: QuoteData): Promise<boolean> => {
  console.log(`[EmailService] Initiating send to ${email}...`);
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1500));

  // Construct email content simulation
  const emailContent = `
    TO: ${email}
    FROM: no-reply@estimategenie.app
    SUBJECT: Your Estimate Genie Quote: ${data.projectName}
    ----------------------------------------------------
    Hi there,

    Your AI-powered estimate is ready!

    PROJECT SUMMARY
    Name: ${data.projectName}
    Total Estimate: ${data.totalEstimatedCostMin.toLocaleString()} - ${data.totalEstimatedCostMax.toLocaleString()} ${data.currency}
    
    DETAILS
    ${data.summary}

    TIMELINE
    Total Phases: ${data.timeline.length}
    
    View your full interactive quote, visualizations, and Veo video tours here:
    https://estimategenie.app/quotes/${btoa(data.projectName + Date.now()).substring(0, 12)}

    Best regards,
    The Estimate Genie Team
  `;

  console.log(emailContent);
  console.log(`[EmailService] Email sent successfully to ${email}`);
  
  return true;
};