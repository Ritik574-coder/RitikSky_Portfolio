import { register } from 'node:module';
import { pathToFileURL } from 'node:url';

register('./assistant-test-hooks.mjs', import.meta.url);
