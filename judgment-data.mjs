// Authoring and release tools only. The app loads the verified protected bank.
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';

export default JSON.parse(gunzipSync(readFileSync(new URL('./judgment-questions.json.gz',import.meta.url))).toString('utf8'));
