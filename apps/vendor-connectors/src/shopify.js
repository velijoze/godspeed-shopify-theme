import fetch from 'node-fetch';

// Environment naming aligned with apps/news-aggregator
const SHOPIFY_STORE = process.env.SHOPIFY_STORE;
const SHOPIFY_ADMIN_TOKEN = process.env.SHOPIFY_ADMIN_TOKEN;

function assertShopifyEnv() {
    if (!SHOPIFY_STORE || !SHOPIFY_ADMIN_TOKEN) {
        throw new Error('Missing SHOPIFY_STORE or SHOPIFY_ADMIN_TOKEN');
    }
}

const API_VERSION = '2024-07';
const GRAPHQL_ENDPOINT = `https://${SHOPIFY_STORE}/admin/api/${API_VERSION}/graphql.json`;
const REST_BASE = `https://${SHOPIFY_STORE}/admin/api/${API_VERSION}`;

async function shopifyGraphQL(query, variables = {}) {
    assertShopifyEnv();
	const res = await fetch(GRAPHQL_ENDPOINT, {
		method: 'POST',
		headers: {
			'X-Shopify-Access-Token': SHOPIFY_ADMIN_TOKEN,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({ query, variables })
	});
	if (!res.ok) {
		const text = await res.text();
		throw new Error(`Shopify GraphQL ${res.status}: ${text}`);
	}
	const json = await res.json();
	if (json.errors) {
		throw new Error(`Shopify GraphQL errors: ${JSON.stringify(json.errors)}`);
	}
	return json.data;
}

async function shopifyREST(path, init = {}) {
    assertShopifyEnv();
	const res = await fetch(`${REST_BASE}${path}`, {
		method: init.method || 'GET',
		headers: {
			'X-Shopify-Access-Token': SHOPIFY_ADMIN_TOKEN,
			'Content-Type': 'application/json'
		},
		body: init.body
	});
	if (!res.ok) {
		const text = await res.text();
		throw new Error(`Shopify REST ${res.status}: ${text}`);
	}
	return res.json();
}

export async function metafieldsSet(ownerId, entries) {
	// entries: [{namespace, key, type, value}]
	const mutation = `
	  mutation metafieldsSet($metafields: [MetafieldsSetInput!]!) {
	    metafieldsSet(metafields: $metafields) {
	      metafields { id key namespace }
	      userErrors { field message }
	    }
	  }`;
	const metafields = entries.map(e => ({
		ownerId,
		namespace: e.namespace,
		key: e.key,
		type: e.type,
		value: String(e.value)
	}));
	const data = await shopifyGraphQL(mutation, { metafields });
	const errs = data.metafieldsSet?.userErrors || [];
	if (errs.length) {
		throw new Error(`metafieldsSet errors: ${JSON.stringify(errs)}`);
	}
	return data.metafieldsSet?.metafields || [];
}

export async function updateProduct(productId, update) {
	return shopifyREST(`/products/${productId}.json`, {
		method: 'PUT',
		body: JSON.stringify({ product: { id: productId, ...update } })
	});
}

export async function updateVariant(variantId, update) {
	return shopifyREST(`/variants/${variantId}.json`, {
		method: 'PUT',
		body: JSON.stringify({ variant: { id: variantId, ...update } })
	});
}

export async function getProductByHandle(handle) {
	const q = `
	  query ($handle: String!){
	    productByHandle(handle: $handle){
	      id
	      handle
	      title
	      bodyHtml
	      tags
	      variants(first: 50){ nodes{ id title sku barcode } }
	    }
	  }`;
	const data = await shopifyGraphQL(q, { handle });
	return data.productByHandle;
}

export async function getProductsByQuery(query, first = 50, after = null) {
	const q = `
	  query ($first: Int!, $after: String, $query: String){
	    products(first: $first, after: $after, query: $query){
	      pageInfo{ hasNextPage endCursor }
	      nodes{
	        id handle title bodyHtml tags
	        variants(first: 50){ nodes{ id title sku barcode } }
	      }
	    }
	  }`;
	const data = await shopifyGraphQL(q, { first, after, query });
	return data.products;
}

export function toGid(type, id) {
	return id?.toString().startsWith('gid://') ? id : `gid://shopify/${type}/${id}`;
}

// Scope: { handles?: string[], tags?: string[], collections?: string[] }
export async function collectProductsByScope(scope) {
	const results = [];
	const handles = Array.isArray(scope?.handles) ? scope.handles : [];
	for (const h of handles) {
		const p = await getProductByHandle(h);
		if (p) results.push(p);
	}
	const tagQuery = (Array.isArray(scope?.tags) && scope.tags.length)
		? scope.tags.map(t => `tag:'${t.replace(/'/g, "\\'")}'`).join(' AND ')
		: '';
	const collQuery = (Array.isArray(scope?.collections) && scope.collections.length)
		? scope.collections.map(c => `collection_title:'${c.replace(/'/g, "\\'")}'`).join(' OR ')
		: '';
	const combined = [tagQuery, collQuery].filter(Boolean).join(' AND ');
	if (combined) {
		let after = null;
		do {
			const page = await getProductsByQuery(combined, 50, after);
			results.push(...page.nodes);
			after = page.pageInfo.hasNextPage ? page.pageInfo.endCursor : null;
		} while (after);
	}
	const seen = new Set();
	return results.filter(p => (seen.has(p.handle) ? false : (seen.add(p.handle), true)));
}

export async function appendProductAudit(productGid, entry) {
	const namespace = 'vendor';
	const key = 'enrichment_audit';
	const now = new Date().toISOString();
	const payload = { ts: now, ...entry };
	const q = `
	  query($id: ID!){
	    product(id:$id){
	      metafield(namespace:"${namespace}", key:"${key}"){ id value }
	    }
	  }`;
	const data = await shopifyGraphQL(q, { id: productGid });
	let current = [];
	try {
		if (data.product?.metafield?.value) current = JSON.parse(data.product.metafield.value);
	} catch (_e) {}
	const next = [...current, payload].slice(-50);
	await metafieldsSet(productGid, [{ namespace, key, type: 'json', value: JSON.stringify(next) }]);
}

export { shopifyGraphQL, shopifyREST };

// Shop-level metafields helpers for config storage
export async function getShopMetafield(namespace, key) {
    const q = `
      query{
        shop{ metafield(namespace: "${namespace}", key: "${key}"){ id key namespace value } }
      }`;
    const data = await shopifyGraphQL(q, {});
    return data.shop?.metafield || null;
}

export async function setShopMetafield(namespace, key, type, value) {
    const mutation = `
      mutation metafieldsSet($metafields: [MetafieldsSetInput!]!){
        metafieldsSet(metafields: $metafields){ metafields{ id key namespace } userErrors{ field message } }
      }`;
    const ownerQ = `query{ shop{ id } }`;
    const owner = await shopifyGraphQL(ownerQ, {});
    const ownerId = owner.shop.id;
    const data = await shopifyGraphQL(mutation, { metafields: [{ ownerId, namespace, key, type, value }] });
    const errs = data.metafieldsSet?.userErrors || [];
    if (errs.length) throw new Error(`setShopMetafield errors: ${JSON.stringify(errs)}`);
    return true;
}


