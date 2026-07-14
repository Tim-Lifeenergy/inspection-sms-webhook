// /api/inspection.js

import { Resend } from "resend";
import twilio from "twilio";

const resend = new Resend(process.env.RESEND_API_KEY);
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const {
      name,
      phone,
      email,
      projectAddress,
      inspectionType,
      preferredDateTime,
      notes
    } = req.body;

    // 1️⃣ Send email through Resend
    await resend.emails.send({
      from: "Tim@lifeenergyinspections.com",
      to: "Tim@lifeenergyinspections.com",
      subject: `New Inspection Request from ${name}`,
      html: `
        <h2>New Inspection Request</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Project Address:</strong> ${projectAddress}</p>
        <p><strong>Inspection Type:</strong> ${inspectionType}</p>
        <p><strong>Preferred Date/Time:</strong> ${preferredDateTime}</p>
        <p><strong>Notes:</strong> ${notes || "None"}</p>
      `
    });

    // 2️⃣ Send SMS through Twilio
    await twilioClient.messages.create({
      body: `New IECC inspection request from ${name}. Address: ${projectAddress}.`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phone
    });

    // 3️⃣ Respond to browser (CORS-safe)
    res.setHeader("Access-Control-Allow-Origin", "https://lifeenergyinspections.com");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
