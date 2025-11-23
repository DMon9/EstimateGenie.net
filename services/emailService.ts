import { QuoteData } from '../types';

export const sendQuoteEmail = async (email: string, data: QuoteData): Promise<boolean> => {
  console.log(`[EmailService] Sending quote to ${email}...`);
  
  try {
    const apiUrl = import.meta.env.VITE_API_URL || '';
    const response = await fetch(`${apiUrl}/api/email/send-quote`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        quoteData: data,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to send email');
    }

    const result = await response.json();
    console.log(`[EmailService] Email sent successfully to ${email}`, result);
    
    return true;
  } catch (error) {
    console.error('[EmailService] Failed to send email:', error);
    throw error;
  }
};
