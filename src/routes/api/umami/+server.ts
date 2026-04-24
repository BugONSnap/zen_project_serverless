export default async function handler(req, res) {
  const url = 'https://api-gateway.umami.dev/api/send';

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(req.body),
  });

  const data = await response.text();
  res.status(response.status).send(data);
}