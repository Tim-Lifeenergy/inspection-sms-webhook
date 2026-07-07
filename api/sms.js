import { Resend } from 'resend';
import twilio from 'twilio';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, phone, email, address, message } = req.body;

  // Send email notification
  const resend = new Resend(process.env.RESEND_API_KEY);

  await resend.emails.send({
    from: 'notifications@lifeenergyinspections.com',
    to: 'tim@lifeenergyinspections.com',
    subject: 'New Inspection Request',
    html: `
      <h2>New Inspection Request</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Phone:</strong> ${phone}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Address:</strong> ${address}</p>
      <p><strong>Message:</strong> ${message}</p>
    `
  });

  // Send SMS notification
  const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH);

  await client.messages.create({
    body: `New inspection request from ${name}.`,
    from: process.env.TWILIO_NUMBER,
    to: process.env.MY_PHONE
  });

  return res.status(200).json({ success: true });
}

