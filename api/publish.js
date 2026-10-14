export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { title, date, body, filename } = req.body;

  if (!title || !body) {
    return res.status(400).json({ error: 'Title and body are required.' });
  }

  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
  const REPO_OWNER = 'mordiifeanyi-git';
  const REPO_NAME = 'tawoetawosan-respo';
  const BRANCH = 'main';

  // Build clean filename from slug
  const slug = filename || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  const filePath = `articles/${slug}.md`;

  // Format as Markdown with frontmatter header
  const fileContent = `---
title: "${title.replace(/"/g, '\\"')}"
date: "${date || new Date().toISOString()}"
---

${body}`;

  const encodedContent = Buffer.from(fileContent).toString('base64');

  try {
    let sha = null;
    const getFileRes = await fetch(
      `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${filePath}`,
      {
        headers: {
          Authorization: `Bearer ${GITHUB_TOKEN}`,
          Accept: 'application/vnd.github.v3+json',
        },
      }
    );

    if (getFileRes.ok) {
      const existingFile = await getFileRes.json();
      sha = existingFile.sha;
    }

    const putRes = await fetch(
      `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${filePath}`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${GITHUB_TOKEN}`,
          'Content-Type': 'application/json',
          Accept: 'application/vnd.github.v3+json',
        },
        body: JSON.stringify({
          message: `Publish article: ${title}`,
          content: encodedContent,
          branch: BRANCH,
          ...(sha ? { sha } : {}),
        }),
      }
    );

    if (!putRes.ok) {
      const errData = await putRes.json();
      return res.status(500).json({ error: errData.message || 'Failed to publish to GitHub.' });
    }

    return res.status(200).json({ success: true, message: 'Article published live!' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}