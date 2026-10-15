export default async function handler(req, res) {
  if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
  }

  const { path, content, message } = req.body;

  if (!path || !content) {
      return res.status(400).json({ error: 'File path and content are required.' });
  }

  const repoOwner = 'mordiifeanyi-git';
  const repoName = 'tawoetawosan-respo';
  const githubToken = process.env.GITHUB_TOKEN;

  if (!githubToken) {
      return res.status(500).json({ error: 'GitHub token not configured on server.' });
  }

  try {
      const githubApiUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${path}`;

      // Check if file already exists to obtain its SHA (for clean overwrites)
      let sha = null;
      const checkRes = await fetch(githubApiUrl, {
          headers: {
              'Authorization': `Bearer ${githubToken}`,
              'Accept': 'application/vnd.github.v3+json'
          }
      });

      if (checkRes.ok) {
          const existing = await checkRes.json();
          sha = existing.sha;
      }

      // Push media asset directly to GitHub repository
      const putRes = await fetch(githubApiUrl, {
          method: 'PUT',
          headers: {
              'Authorization': `Bearer ${githubToken}`,
              'Accept': 'application/vnd.github.v3+json',
              'Content-Type': 'application/json'
          },
          body: JSON.stringify({
              message: message || `Upload media asset: ${path}`,
              content: content,
              branch: 'main',
              ...(sha && { sha })
          })
      });

      if (putRes.ok) {
          return res.status(200).json({ success: true, path: `/${path}` });
      } else {
          const errorData = await putRes.json();
          return res.status(500).json({ error: errorData.message || 'Failed to upload media to GitHub' });
      }
  } catch (err) {
      console.error('Media upload error:', err);
      return res.status(500).json({ error: 'Internal server error during media upload' });
  }
}