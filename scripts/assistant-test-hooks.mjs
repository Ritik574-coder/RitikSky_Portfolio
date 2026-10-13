import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, extname, join } from 'node:path';

export async function resolve(specifier, context, nextResolve) {
  if (specifier.startsWith('.') && !extname(specifier)) {
    const parentPath = fileURLToPath(context.parentURL);
    const candidate = join(dirname(parentPath), `${specifier}.js`);
    if (existsSync(candidate)) {
      return nextResolve(pathToFileURL(candidate).href, context);
    }
  }
  return nextResolve(specifier, context);
}

function asText(source) {
  if (typeof source === 'string') return source;
  if (source == null) return null;
  if (source instanceof Uint8Array) return new TextDecoder().decode(source);
  if (ArrayBuffer.isView(source)) return new TextDecoder().decode(source);
  return String(source);
}

export async function load(url, context, nextLoad) {
  if (url.startsWith('file:') && url.endsWith('.js')) {
    const path = fileURLToPath(url);
    if (existsSync(path)) {
      let source = readFileSync(path, 'utf8');
      if (source.includes('import.meta.env')) {
        source = source.replaceAll('import.meta.env', '({ BASE_URL: "/" })');
      }
      return {
        format: 'module',
        shortCircuit: true,
        source,
      };
    }
  }

  const result = await nextLoad(url, context);
  const text = asText(result.source);
  if (result.format === 'module' && text && text.includes('import.meta.env')) {
    return {
      ...result,
      source: text.replaceAll('import.meta.env', '({ BASE_URL: "/" })'),
    };
  }
  return result;
}
