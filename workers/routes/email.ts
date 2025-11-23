import { Hono } from 'hono';
import type { Env } from '../index';

export const emailRoutes = new Hono<{ Bindings: Env }>();

emailRoutes.post('/send-quote', async (c) => {
  try {
    const { email, quoteData } = await c.req.json();

    if (!email || !quoteData) {
      return c.json({ error: 'Email and quote data are required' }, 400);
    }

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; }
          .summary { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🏗️ ${quoteData.projectName}</h1>
            <p>Your AI-Powered Estimate is Ready!</p>
          </div>
          <div class="content">
            <h2>Project Summary</h2>
            <div class="summary">
              <p><strong>Total Estimate:</strong> $${quoteData.totalEstimatedCostMin.toLocaleString()} - $${quoteData.totalEstimatedCostMax.toLocaleString()} ${quoteData.currency}</p>
              <p><strong>Description:</strong> ${quoteData.summary || 'N/A'}</p>
              <p><strong>Timeline Phases:</strong> ${quoteData.timeline.length}</p>
            </div>
            <p>Your detailed quote includes cost breakdowns, phased timelines, material lists, and design suggestions.</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Estimate Genie - AI-Powered Construction Estimates</p>
            <p>Powered by Google Gemini</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${c.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Estimate Genie <onboarding@resend.dev>',
        to: email,
        subject: `Your Estimate: ${quoteData.projectName}`,
        html: emailHtml,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error);
    }

    const result = await response.json();
    return c.json({ success: true, messageId: result.id });
  } catch (error: any) {
    console.error('Email sending error:', error);
    return c.json({ error: 'Failed to send email', details: error.message }, 500);
  }
});
