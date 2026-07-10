import { execSync } from 'node:child_process';
import { readFileSync, readdirSync, rmSync } from 'node:fs';
import { gzipSync } from 'node:zlib';

const scenarios = [
  { name: 'destructure', label: 'const { x } = await import(...)' },
  { name: 'property-access', label: 'sentry.x  (member access)' },
];

rmSync('dist', { recursive: true, force: true });

const results = scenarios.map(({ name, label }) => {
  execSync(`npx vite build -c vite.${name}.config.mjs`, { stdio: 'ignore' });

  const dir = `dist/${name}/assets`;
  const file = readdirSync(dir).find(f => f.endsWith('.js'));
  const code = readFileSync(`${dir}/${file}`);
  const hasReplay = /rrweb|MutationBuffer|takeFullSnapshot/.test(code.toString());

  return { name, label, raw: code.length, gzip: gzipSync(code).length, hasReplay };
});

const kb = n => `${(n / 1024).toFixed(1)} KB`;
const pad = (s, n) => String(s).padEnd(n);

console.log('\n@sentry/react deferred import, built with Vite 8 (Rolldown)\n');
console.log(pad('scenario', 18), pad('min', 11), pad('gzip', 11), 'replay pulled in?');
console.log('-'.repeat(60));
for (const r of results) {
  console.log(pad(r.name, 18), pad(kb(r.raw), 11), pad(kb(r.gzip), 11), r.hasReplay ? 'YES' : 'no');
}

const [a, b] = results;
const savedRaw = a.raw - b.raw;
const savedGzip = a.gzip - b.gzip;
console.log('-'.repeat(60));
console.log(`\ndelta: ${kb(savedRaw)} min / ${kb(savedGzip)} gzip removed`);
console.log(`       ${(a.raw / b.raw).toFixed(1)}x smaller by switching to property access\n`);
