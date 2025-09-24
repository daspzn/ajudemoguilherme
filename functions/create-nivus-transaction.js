// functions/create-nivus-transaction.js

exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Use POST' }) };
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const { total_amount, customer } = body;

    if (!total_amount || isNaN(total_amount)) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Valor inválido' }) };
    }

    // pega token / chave da variável de ambiente
    const NIVUS_TOKEN = process.env.NIVUS_TOKEN;  
    if (!NIVUS_TOKEN) {
      return { statusCode: 500, body: JSON.stringify({ error: 'Chave Nivus não configurada' }) };
    }

    // montar payload conforme o docs da Nivus
    const payload = {
      amount: total_amount,
      payment_method: "pix",
      customer: {
        name: customer?.name || "Cliente Teste",
        email: customer?.email || "vitorsouzasimaocg@gmail.com",
        document_type: customer?.document_type || "CPF",
        document: customer?.document || "71840638486"
      }
      // outros campos obrigatórios que o Nivus pedir (webhook, ip, etc)
    };

    const resp = await fetch("https://pay.nivuspay.com.br/api/v1/transaction.getPaymentsByCustomer", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${NIVUS_TOKEN}`
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
