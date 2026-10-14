// api/auth.js
export default async function handler(req, res) {
  const client_id = "0v23liMVjYK5IwlYzPN0";
  const redirect_uri = `https://${req.headers.host}/api/callback`;
  
  const githubUrl = `https://github.com/login/oauth/authorize?client_id=${client_id}&redirect_uri=${encodeURIComponent(redirect_uri)}&scope=repo,user`;
  
  res.redirect(302, githubUrl);
}