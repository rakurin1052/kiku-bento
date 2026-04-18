exports.handler = async function(event) {
  const SQUARE_ACCESS_TOKEN = 'EAAAl4wypk_WCB44lSf_d61BgPRxcBW0hiD7nizVdJL8OYsMUKT2D281mEN9A-LH';
  const SQUARE_LOCATION_ID = 'LB9Y5T27BCK9E';

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const body = JSON.parse(event.body);
    const { items, email, note, sd } = body;

    const response = await fetch('https://connect.squareupsandbox.com/v2/online-checkout/payment-links', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + SQUARE_ACCESS_TOKEN,
        'Square-Version': '2024-01-17'
      },
      body: JSON.stringify({
        idempotency_key: Date.now().toString(),
        order: {
          location_id: SQUARE_LOCATION_ID,
          line_items: items
        },
        checkout_options: {
          allow_tipping: false,
          ask_for_shipping_address: false,
          redirect_url: 'https://guileless-lollipop-0d8e3c.netlify.app/?success=true'
        },
        pre_populated_data: {
          buyer_email: email
        }
      })
    });

    const data = await response.json();

    if (data.payment_link && data.payment_link.url) {
      return {
        statusCode: 200,
        body: JSON.stringify({ url: data.payment_link.url })
      };
    } else {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: data })
      };
    }
  } catch (e) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: e.message })
    };
  }
};