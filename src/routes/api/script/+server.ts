export default async function handler(req, res) {
  const response = await fetch('https://umami.is/script.js');
  const text = await response.text();

  res.setHeader('Content-Type', 'application/javascript');
  res.send(text);
}