/**
 * Generic API Handler
 * * This script handles booking submissions in a way that is easily portable
 * to other environments (Node.js, Express, AWS Lambda) by following
 * standard Request/Response patterns.
 */

export async function onRequest(context) {
  const { request } = context;

  // 1. Method Security
  // We strictly allow POST requests for data submission.
  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method Not Allowed" }), { 
      status: 405, 
      headers: { 
        "Content-Type": "application/json",
        "Allow": "POST"
      } 
    });
  }

  try {
    // 2. Data Extraction
    const data = await request.json();
    const { name, email, phone, event_type, event_date, message } = data;

    // 3. Basic Validation
    if (!name || !email || !message) {
       return new Response(JSON.stringify({ 
         error: "Incomplete inquiry. The spirits require at least a name, email, and message." 
       }), { 
         status: 400,
         headers: { "Content-Type": "application/json" }
       });
    }

    /**
     * INTEGRATION POINT:
     * To send a real email, you would replace the block below with a call
     * to your chosen provider's API. 
     * * Example for a generic provider:
     * await fetch('https://api.yourprovider.com/send', {
     * method: 'POST',
     * headers: { 'Authorization': 'Bearer YOUR_KEY' },
     * body: JSON.stringify({ to: 'mike256+evernaught@gmail.com', ... })
     * });
     */

    // Logging the inquiry for debugging (Visible in Cloudflare logs)
    console.log(`New Inquiry from ${name} (${email}): ${event_type} on ${event_date || 'TBD'}`);

    // 4. Success Response
    // We return a standard JSON success message that the frontend expects.
    return new Response(JSON.stringify({ 
      success: true, 
      message: "The correspondence has been successfully lodged in the ether.",
      timestamp: new Date().toISOString()
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });

  } catch (err) {
    // 5. Error Handling
    return new Response(JSON.stringify({ 
      error: "A mystical interruption occurred.", 
      details: err.message 
    }), { 
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
