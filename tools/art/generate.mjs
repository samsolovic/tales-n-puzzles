#!/usr/bin/env node
/**
 * Minimal Volcengine Ark image generator.
 *
 * Usage:
 *   node tools/art/generate.mjs --config tools/art/prompts/act1-key-art.json
 *
 * The Ark key is read from .env or the process environment. It is never logged.
 */
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const ROOT = process.cwd();

function loadEnv() {
  const file = path.join(ROOT, '.env');
  if (!fs.existsSync(file)) return;
  for (const line of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const at = trimmed.indexOf('=');
    if (at < 0) continue;
    const key = trimmed.slice(0, at).trim();
    let value = trimmed.slice(at + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = value;
  }
}

function parseArgs() {
  const args = process.argv.slice(2);
  const out = {};
  for (let i = 0; i < args.length; i += 1) {
    if (args[i].startsWith('--')) out[args[i].slice(2)] = args[i + 1];
  }
  return out;
}

function mimeFor(file) {
  const ext = path.extname(file).toLowerCase();
  if (ext === '.png') return 'image/png';
  if (ext === '.webp') return 'image/webp';
  return 'image/jpeg';
}

function toDataUrl(file) {
  const abs = path.resolve(ROOT, file);
  return `data:${mimeFor(abs)};base64,${fs.readFileSync(abs).toString('base64')}`;
}

function stamp() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function requestImage(config, index) {
  const apiKey = process.env.ARK_API_KEY;
  const baseUrl = (process.env.ARK_BASE_URL || 'https://ark.cn-beijing.volces.com/api/v3').replace(/\/$/, '');
  const model = process.env.ARK_IMAGE_MODEL;
  if (!apiKey) throw new Error('ARK_API_KEY is missing in .env');
  if (!model) throw new Error('ARK_IMAGE_MODEL is missing in .env');

  const body = {
    model,
    prompt: config.prompt,
    response_format: 'url',
    size: config.size || '2K',
    watermark: false,
  };
  if (config.reference) body.image = [toDataUrl(config.reference)];
  if (config.extra && typeof config.extra === 'object') Object.assign(body, config.extra);

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const response = await fetch(`${baseUrl}/images/generations`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(300000),
    });
    const text = await response.text();
    let data;
    try { data = JSON.parse(text); } catch { data = { raw: text }; }
    if (response.status === 429 && attempt < 2) {
      console.log(`rate limited, retrying in 25s (attempt ${attempt + 1}/3)`);
      await sleep(25000);
      continue;
    }
    if (!response.ok) {
      throw new Error(`Ark HTTP ${response.status}: ${JSON.stringify(data).slice(0, 1200)}`);
    }
    return { data, body: { model, size: body.size, hasReference: Boolean(config.reference) } };
  }
  throw new Error('Ark request failed after retries');
}

async function saveImages(result, config) {
  const outDir = path.resolve(ROOT, config.outDir || 'docs/art/scenes');
  fs.mkdirSync(outDir, { recursive: true });
  const prefix = config.prefix || 'generated';
  const run = `${prefix}-${stamp()}`;
  const images = result.data?.data || [];
  if (!images.length) throw new Error(`No images in response: ${JSON.stringify(result.data).slice(0, 1200)}`);
  const saved = [];
  const layers = [];
  for (let i = 0; i < images.length; i += 1) {
    const item = images[i];
    if (!item.url) {
      console.warn('result has no url', Object.keys(item));
      continue;
    }
    const imageResponse = await fetch(item.url);
    if (!imageResponse.ok) throw new Error(`download failed HTTP ${imageResponse.status}`);
    const type = imageResponse.headers.get('content-type') || 'image/jpeg';
    const ext = type.includes('png') ? 'png' : type.includes('webp') ? 'webp' : 'jpg';
    const suffix = item.z_index !== undefined ? `z${item.z_index}` : `${i + 1}`;
    const file = path.join(outDir, `${run}-${suffix}.${ext}`);
    fs.writeFileSync(file, Buffer.from(await imageResponse.arrayBuffer()));
    saved.push(file);
    layers.push({
      file,
      zIndex: item.z_index ?? null,
      name: item.name ?? null,
      description: item.description ?? null,
      boundingBox: item.bounding_box ?? null,
      size: item.size ?? null,
      outputFormat: item.output_format ?? null,
    });
  }
  const meta = {
    run,
    prompt: config.prompt,
    reference: config.reference || null,
    requestedModel: process.env.ARK_IMAGE_MODEL,
    requestedSize: config.size || '2K',
    layerDecomposition: Boolean(config.extra?.layer_decomposition),
    responseModel: result.data?.model || null,
    responseCreated: result.data?.created || null,
    images: saved,
    layers,
    rawUsage: result.data?.usage || null,
  };
  fs.writeFileSync(path.join(outDir, `${run}.json`), JSON.stringify(meta, null, 2));
  return { saved, meta };
}

async function main() {
  loadEnv();
  const args = parseArgs();
  if (!args.config) throw new Error('Usage: node tools/art/generate.mjs --config <json>');
  const config = JSON.parse(fs.readFileSync(path.resolve(ROOT, args.config), 'utf8'));
  if (!config.prompt) throw new Error('config.prompt is required');
  console.log('model:', process.env.ARK_IMAGE_MODEL);
  console.log('base:', process.env.ARK_BASE_URL);
  console.log('size:', config.size || '2K');
  console.log('reference:', config.reference || 'none');
  const result = await requestImage(config, 0);
  const saved = await saveImages(result, config);
  console.log('saved:', saved.saved.join('\n'));
  console.log('metadata:', path.join(config.outDir || 'docs/art/scenes', `${saved.meta.run}.json`));
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
