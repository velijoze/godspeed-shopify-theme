import fetch from 'node-fetch';

const STORE = process.env.SHOPIFY_STORE;
const TOKEN = process.env.SHOPIFY_ADMIN_TOKEN;
const API = `https://${STORE}/admin/api/2024-07`;

async function shopify(path, init = {}) {
  const res = await fetch(`${API}${path}`, {
    method: 'GET',
    headers: {
      'X-Shopify-Access-Token': TOKEN,
      'Content-Type': 'application/json'
    },
    ...init
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`${res.status} ${res.statusText}: ${t}`);
  }
  return res.json();
}

export async function getBlogIdByHandle(handle) {
  const data = await shopify(`/blogs.json`);
  const blog = (data.blogs || []).find(b => b.handle === handle) || (data.blogs || [])[0];
  return blog?.id || null;
}

export async function createArticleDraft(blogId, { title, body_html, tags, author, excerpt, source_url }) {
  const payload = {
    article: {
      title,
      author,
      tags: (tags || []).join(', '),
      body_html,
      summary_html: excerpt || undefined,
      blog_id: blogId,
      published: false,
      metafields: source_url ? [
        { namespace: 'news', key: 'source_url', type: 'single_line_text_field', value: String(source_url).slice(0, 2000) }
      ] : []
    }
  };
  const res = await shopify(`/blogs/${blogId}/articles.json`, { method: 'POST', body: JSON.stringify(payload) });
  return res.article;
}

export async function addArticleMetafields(articleId, metafields) {
  const payload = { metafields };
  await shopify(`/articles/${articleId}/metafields.json`, { method: 'POST', body: JSON.stringify(payload) });
}


