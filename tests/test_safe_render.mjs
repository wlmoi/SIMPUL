import assert from 'node:assert/strict';
import { safe } from '../js/util.js';
const payload = '<img src=x onerror="alert(1)">';
assert(!safe(payload).includes('<img'));
assert(!safe(payload).includes('"alert'));
assert.equal(safe('"\'><script>alert(1)</script>'), '&quot;&#39;&gt;&lt;script&gt;alert(1)&lt;/script&gt;');
console.log('PASS HTML escaping of untrusted observation text');
