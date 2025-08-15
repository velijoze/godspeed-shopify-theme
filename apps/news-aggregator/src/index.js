import Parser from 'rss-parser';
import crypto from 'crypto';
import { createArticleDraft, getBlogIdByHandle, addArticleMetafields } from './shopify.js';
import { summarizeAndEnrich, translateAll } from './llm.js';

const FEEDS = (process.env.FEEDS || '').split(',').map(s => s.trim()).filter(Boolean);
const BLOG_HANDLE = process.env.BLOG_HANDLE || 'journal';
const LANGS = (process.env.LANGS || 'en,de,fr,it').split(',').map(s => s.trim());
const DEFAULT_LANG = process.env.DEFAULT_LANG || 'en';

const parser = new Parser({ timeout: 15000 });

function hashId(input) {
  return crypto.createHash('sha256').update(input).digest('hex');
}

function loadState() {
  try {
    const json = JSON.parse(process.env.NEWS_AGG_STATE || '{}');
    return json;
  } catch {
    return {};
  }
}

function saveState(state) {
  // In CI/one-off runs we keep state in-memory or env; to persist, run this app as a service and write to a DB or file.
  process.env.NEWS_AGG_STATE = JSON.stringify(state).slice(0, 131072); // cap
}

async function fetchFeedItems() {
  const items = [];
  for (const url of FEEDS) {
    try {
      const feed = await parser.parseURL(url);
      for (const it of feed.items || []) {
        const id = hashId(it.link || it.guid || it.isoDate || it.title || JSON.stringify(it));
        items.push({
          id,
          source: feed.title || url,
          title: it.title || '',
          link: it.link || '',
          isoDate: it.isoDate || it.pubDate || null,
          content: it['content:encoded'] || it.content || it.contentSnippet || '',
          categories: it.categories || []
        });
      }
    } catch (e) {
      // Skip failing feed; log minimal info
      console.error(`Feed error: ${url}: ${e.message}`);
    }
  }
  return items;
}

function dedupe(items, seen) {
  const out = [];
  for (const it of items) {
    if (seen[it.id]) continue;
    // Basic duplicate by URL or normalized title
    const normTitle = it.title.toLowerCase().replace(/\s+/g, ' ').trim();
    const exists = out.find(o => o.link === it.link || o.title.toLowerCase().replace(/\s+/g, ' ').trim() === normTitle);
    if (!exists) out.push(it);
  }
  return out;
}

function toShopifyTags(categories = [], source = '') {
  const base = categories.map(c => String(c).replace(/[,]/g, ' ').trim()).filter(Boolean);
  if (source) base.push(`source:${source}`);
  return Array.from(new Set(base)).slice(0, 10);
}

async function run() {
  if (!process.env.SHOPIFY_STORE || !process.env.SHOPIFY_ADMIN_TOKEN) {
    throw new Error('Missing SHOPIFY_STORE or SHOPIFY_ADMIN_TOKEN');
  }
  if (!FEEDS.length) {
    throw new Error('FEEDS is empty');
  }

  const state = loadState();
  const blogId = await getBlogIdByHandle(BLOG_HANDLE);
  if (!blogId) throw new Error(`Blog not found for handle: ${BLOG_HANDLE}`);

  const raw = await fetchFeedItems();
  const fresh = dedupe(raw, state);
  if (!fresh.length) {
    console.log('No new items');
    return;
  }

  for (const item of fresh.slice(0, 10)) { // safety: at most 10 per run
    try {
      const enrich = await summarizeAndEnrich(item);
      const title = enrich.title || item.title;
      const excerpt = enrich.excerpt || '';
      const body_html = enrich.body_html || `<p>${item.content?.slice(0, 800)}</p><p><a href="${item.link}">Source</a></p>`;
      const tags = Array.from(new Set([...(enrich.tags || []), ...toShopifyTags(item.categories, item.source)])).slice(0, 15);

      const created = await createArticleDraft(blogId, { title, body_html, tags, author: 'Godspeed News', excerpt, source_url: item.link });

      if (created?.id) {
        // Optional translations stored as metafields for review
        const tr = await translateAll({ title, body_html }, LANGS.filter(l => l !== DEFAULT_LANG));
        if (tr && Object.keys(tr).length) {
          await addArticleMetafields(created.id, [
            ...Object.entries(tr).map(([lang, payload]) => ({
              namespace: 'i18n',
              key: `article_${lang}`,
              type: 'json',
              value: JSON.stringify(payload).slice(0, 65500)
            }))
          ]);
        }
        state[item.id] = { created_article_id: created.id, link: item.link, at: Date.now() };
        console.log(`Draft created: ${created.admin_graphql_api_id || created.id} ← ${item.title}`);
      }
    } catch (e) {
      console.error(`Create error for ${item.link}: ${e.message}`);
    }
  }

  saveState(state);
}

run().catch(e => {
  console.error(e);
  process.exit(1);
});


