export default async function handler(req, res) {
  if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
  }

  const { filename } = req.body;

  if (!filename) {
      return res.status(400).json({ error: 'Filename is required' });
  }

  const repoOwner = 'mordiifeanyi-git';
  const repoName = 'tawoetawosan-respo';
  const githubToken = process.env.GITHUB_TOKEN;

  if (!githubToken) {
      return res.status(500).json({ error: 'GitHub token not configured on server' });
  }

  try {
      // 1. Fetch the file SHA from GitHub first (required by GitHub API to delete files)
      const getFileRes = await fetch(`https://api.github.com/repos/${repoOwner}/${repoName}/contents/articles/${filename}`, {
          headers: {
              'Authorization': `Bearer ${githubToken}`,
              'Accept': 'application/vnd.github.v3+json'
          }
      });

      if (!getFileRes.ok) {
          return res.status(404).json({ error: 'Article file not found on GitHub repository.' });
      }

      const fileData = await getFileRes.json();
      const sha = fileData.sha;

      // 2. Delete the file using the GitHub Contents API
      const deleteRes = await fetch(`https://api.github.com/repos/${repoOwner}/${repoName}/contents/articles/${filename}`, {
          method: 'DELETE',
          headers: {
              'Authorization': `Bearer ${githubToken}`,
              'Accept': 'application/vnd.github.v3+json',
              'Content-Type': 'application/json'
          },
          body: JSON.stringify({
              message: `Delete article ${filename} via Admin Workbench`,
              sha: sha,
              branch: 'main'
          })
      });

      if (deleteRes.ok) {
          return res.status(200).json({ message: 'Article deleted successfully' });
      } else {
          const errorData = await deleteRes.json();
          return res.status(500).json({ error: errorData.message || 'Failed to delete from GitHub' });
      }

  } catch (err) {
      console.error('Delete error:', err);
      return res.status(500).json({ error: 'Internal server error during deletion' });
  }
}