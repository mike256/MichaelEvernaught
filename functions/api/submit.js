/**
 * Cloudflare Pages Function to handle booking submissions.
 * This script processes the form and sends an email using MailChannels.
 */

export async function onRequest(context) {
  // Only allow POST requests
  if (context.request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method Not Allowed" }), { 
      status: 405,
      headers: { "Content-Type": "application/json", "Allow": "POST" }
    });
  }
  return onRequestPost(context);
}

export async function onRequestPost(context) {
  try {
    const data = await context.request.json();
    const { name, email, phone, event_type, event_date, message } = data;

    // Validate required fields
    if (!name || !email || !event_type || !message) {
      return new Response(JSON.stringify({ error: "Required fields are missing." }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    const emailBody = `
Greetings Michael,

A new manifestation request has been lodged via the Ledger of Inquiry.

--------------------------------------------------
SENDER: ${name}
EMAIL: ${email}
PHONE: ${phone || 'Not provided'}
NATURE: ${event_type}
PROPOSED DATE: ${event_date || 'TBD'}

MESSAGE:
${message}
--------------------------------------------------

Expect magic.
    `;

    // MailChannels integration
    const sendEmailResponse = await fetch("https://api.mailchannels.net/tx/v1/send", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: "mike256+evernaught@gmail.com", name: "Michael Evernaught" }] }],
        from: { email: "no-reply@michaelevernaught.com", name: "The Man of Wonder Website" },
        subject: `New Booking Request: ${event_type} from ${name}`,
        content: [{ type: "text/plain", value: emailBody }],
      }),
    });

    if (!sendEmailResponse.ok) {
        const errorText = await sendEmailResponse.text();
        return new Response(JSON.stringify({ error: `Email service failed: ${errorText}` }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }

    return new Response(JSON.stringify({ success: true, message: "Correspondence dispatched." }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
