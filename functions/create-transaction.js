// functions/create-transaction.js

exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Use POST' }) };
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const total_amount = Number(body.total_amount);
    if (!total_amount || total_amount <= 0) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Valor inválido' }) };
    }

    const PEPPER_TOKEN = process.env.PEPPER_TOKEN; // seu token
    const PEPPER_API_TOKEN = process.env.PEPPER_API_TOKEN; // api_token da Pepper
    if (!PEPPER_TOKEN || !PEPPER_API_TOKEN) {
      return { statusCode: 500, body: JSON.stringify({ error: 'Token da Pepper não configurado' }) };
    }

    // converter reais para centavos
    const amountInCents = Math.round(total_amount * 100);

    const payload = {
      api_token: PEPPER_API_TOKEN,
      amount: amountInCents,
      payment_method: "pix",
      cart: [
        {
          offer_hash: body.offer_hash || "off_123",
          price: amountInCents,
          quantity: 1,
          product_hash: body.product_hash || "abc12x2",
          operation_type: 1,
          title: body.title || "Doação",
          cover: body.cover || "https://google.com/image"
        }
      ],
      installments: 1,
      customer: {
        name: body.customer?.name || "Usuário Teste",
        email: body.customer?.email || "teste@exemplo.com",
        phone_number: body.customer?.phone_number || "11999999999",
        document: body.customer?.document?.replace(/\D/g, '') || "11144477735"
      },
      tracking: body.tracking || {
        src: "site",
        utm_source: "direct",
        utm_campaign: "default",
        utm_content: "pix_button",
        utm_term: "pix",
        utm_medium: "web"
      }
    };

    const resp = await fetch("https://api.cloud.pepperpay.com.br/public/v1/transactions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${PEPPER_TOKEN}`
      },
      body: JSON.stringify(payload)
    });

    const data = await resp.json();

    return {
      statusCode: resp.status,
      body: JSON.stringify(data)
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Erro no servidor",
        details: err.message
      })
    };
  }
};
