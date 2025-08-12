import OpenAI from 'openai';

const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;

function safe(text = '', max = 4000) {
  return String(text || '').replace(/<script[\s\S]*?<\/script>/gi, '').slice(0, max);
}

export async function summarizeAndEnrich(item) {
  if (!openai) return { title: item.title, body_html: `<p>${safe(item.content, 2000)}</p><p><a href="${item.link}">Source</a></p>`, tags: item.categories || [] };
  const sys = 'You are an assistant that writes concise, neutral cycling news posts for a Swiss bike retailer. JSON only.';
  const usr = `Source: ${item.source}\nTitle: ${item.title}\nURL: ${item.link}\nBody: ${safe(item.content, 6000)}`;
  const res = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: sys },
      { role: 'user', content: `Write JSON with keys: title, excerpt (<=240 chars), body_html (<=1500 words, simple HTML), tags[] (<=8), categories[] (<=4), seo_title (<=60), meta_description (<=160), slug.\n${usr}` }
    ],
    temperature: 0.4,
    response_format: { type: 'json_object' }
  });
  const parsed = JSON.parse(res.choices[0].message.content || '{}');
  return parsed;
}

export async function translateAll(payload, targetLangs) {
  if (!openai || !targetLangs?.length) return {};
  const out = {};
  for (const lang of targetLangs) {
    const res = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: `Translate to ${lang} for a cycling retailer audience. Preserve HTML and links. JSON only.` },
        { role: 'user', content: JSON.stringify(payload) }
      ],
      temperature: 0.2,
      response_format: { type: 'json_object' }
    });
    out[lang] = JSON.parse(res.choices[0].message.content || '{}');
  }
  return out;
}


