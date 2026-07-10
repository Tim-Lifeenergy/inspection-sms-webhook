import { Resend } from 'resend';
import twilio from 'twilio';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Parse JSON body correctly for Vercel
  const body = await req.json();

  const {
    name,
    phone,
    email,
    address,
    inspection_type,
    preferred_datetime,
    notes
  } = body;

  // Validate required fields
  if (!name || !phone || !email || !address || !inspection_type) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Send email notification via Resend
  const resend = new Resend(process.env.RESEND_API_KEY);

  await resend.emails.send({
    from: 'notifications@lifeenergyinspections.com',
    to: 'tim@lifeenergyinspections.com',
    subject: `New IECC Inspection Request from ${name}`,
    html: `
      <h2>New Inspection Request</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Phone:</strong> ${phone}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Project Address:</strong> ${address}</p>
      <p><strong>Inspection Type:</strong> ${inspection_type}</p>
      <p><strong>Preferred Date/Time:</strong> ${preferred_datetime || 'Not specified'}</p>
      <p><strong>Notes:</strong> ${notes || 'None'}</p>
    `
  });

  // Send SMS notification via Twilio
  const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH);

  await client.messages.create({
    body: `New IECC inspection request from ${name}. Type: ${inspection_type}. Address: ${address}.`,
    from: process.env.TWILIO_NUMBER,
    to: process.env.MY_PHONE
  });

  return res.status(200).json({ success: true });
}
