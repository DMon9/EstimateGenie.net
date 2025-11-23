import express, { Request, Response } from 'express';
import { Resend } from 'resend';

const router = express.Router();
const resend = new Resend(process.env.RESEND_API_KEY);

router.post('/send-quote', async (req: Request, res: Response) => {
  try {
    const { email, quoteData } = req.body;

    if (!email || !quoteData) {
      return res.status(400).json({ error: 'Email and quote data are required' });
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
          .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
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
            <p>Return to Estimate Genie to view your full interactive quote with visualizations and downloadable PDF.</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Estimate Genie - AI-Powered Construction Estimates</p>
            <p>Powered by Google Gemini</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const result = await resend.emails.send({
      from: 'Estimate Genie <onboarding@resend.dev>',
      to: email,
      subject: `Your Estimate: ${quoteData.projectName}`,
      html: emailHtml,
    });

    res.json({ success: true, messageId: result.data?.id });
  } catch (error: any) {
    console.error('Email sending error:', error);
    res.status(500).json({ 
      error: 'Failed to send email', 
      details: error.message 
    });
  }
});

export default router;
