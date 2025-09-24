// functions/create-pepper-transaction.js

exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Use POST' }) };
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const { total_amount } = body;

    if (!total_amount) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Valor inválido' }) };
    }

    const PEPPER_API_TOKEN = process.env.PEPPER_API_TOKEN;
    const PEPPER_TOKEN = process.env.PEPPER_TOKEN;

    // ⚠️ ajuste os campos abaixo conforme a API Pepper exigir
    const payload = {
      amount: total_amount,
      payment_method: "pix",
      customer: {
        name: "Cliente Teste",
        email: "teste@exemplo.com",
        document_type: "CPF",
        document: "12345678900"
      }
    };

    const resp = await fetch("https://api.pepper.com.br/v1/transactions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${PEPPER_API_TOKEN}`, // chave principal
        "x-access-token": PEPPER_TOKEN               // se a Pepper exigir os 2 tokens
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
      body: JSON.stringify({ error: err.message })
    };
  }
};
