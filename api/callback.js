// api/callback.js
export default async function handler(req, res) {
  const code = req.query.code;
  const client_id = "0v23liMVjYK5IwlYzPN0";
  const client_secret = "b6ed8875bbf50e373f85c2efac3ade20c57c5a1c";

  try {
    const response = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        client_id,
        client_secret,
        code,
      }),
    });

    const data = await response.json();
    const token = data.access_token;

    const content = `
      <script>
        function receiveMessage(e) {
          window.opener.postMessage(
            'authorization:github:success:${JSON.stringify({ token, provider: 'github' })}',
            e.origin
          );
        }
        window.addEventListener("message", receiveMessage, false);
        window.opener.postMessage("authorizing:github", "*");
      </script>
    `;

    res.setHeader('Content-Type', 'text/html');
    res.send(content);
  } catch (error) {
    res.status(500).send(error.message);
  }
}