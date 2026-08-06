/**
 * Collect the people who have contributed to SP Night, across every repository
 * in the organisation, into src/data/contributors.json.
 *
 * Run by hand (`npm run contributors`) or weekly by
 * .github/workflows/contributors.yml, which opens a pull request when the
 * result changes — the same pattern as the contract sync, for the same reason:
 * a file that changes without a diff anyone reads is a file nobody trusts.
 *
 * Aggregating across the whole org matters. Most of the work is in the port
 * repositories and the engine; a list built from this repository alone would
 * credit the website and call it the project.
 *
 * Needs no token for public data, but sends one when GITHUB_TOKEN is set —
 * unauthenticated GitHub API is 60 requests an hour, which one run can reach.
 */
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ORG = 'sp-night';
const root = join(dirname(fileURLToPath(import.meta.url)), '..');

/**
 * Nobody who is not a person.
 *
 * The API's own `type: 'Bot'` misses an account that commits under a plain user
 * identity, which is what a CI token or an assistant's co-author trailer looks
 * like — so the names are listed too. This is deliberate: the wall credits
 * people, and a generated commit is not a contributor.
 */
const NOT_A_PERSON = new Set([
  'github-actions',
  'dependabot',
  'renovate',
  'renovate-bot',
  'claude',
  'claude-bot',
  'copilot',
]);

const isPerson = (c) =>
  c.type === 'User' && !c.login.endsWith('[bot]') && !NOT_A_PERSON.has(c.login.toLowerCase());

async function api(path) {
  const res = await fetch(`https://api.github.com${path}`, {
    headers: {
      accept: 'application/vnd.github+json',
      'user-agent': 'sp-night-site',
      ...(process.env.GITHUB_TOKEN ? { authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {}),
    },
  });
  if (!res.ok) throw new Error(`GET ${path} → ${res.status} ${res.statusText}`);
  return res.json();
}

const repos = await api(`/orgs/${ORG}/repos?per_page=100&type=public`);

const people = new Map();
let stars = 0;

for (const repo of repos) {
  stars += repo.stargazers_count ?? 0;

  // 204 on an empty repository, and the org profile repo has no contributors.
  const contributors = await api(`/repos/${ORG}/${repo.name}/contributors?per_page=100`).catch(
    () => [],
  );

  for (const c of contributors) {
    if (!isPerson(c)) continue;
    const seen = people.get(c.login) ?? {
      login: c.login,
      id: c.id,
      url: c.html_url,
      contributions: 0,
      repos: [],
    };
    seen.contributions += c.contributions;
    seen.repos.push(repo.name);
    people.set(c.login, seen);
  }
}

const contributors = [...people.values()].sort(
  (a, b) => b.contributions - a.contributions || a.login.localeCompare(b.login),
);
for (const p of contributors) p.repos.sort();

const out = { org: ORG, stars, repos: repos.length, contributors };

writeFileSync(join(root, 'src/data/contributors.json'), `${JSON.stringify(out, null, 2)}\n`);

console.log(
  `${contributors.length} people across ${repos.length} repositories · ${stars} stars\n` +
    contributors.map((p) => `  ${p.login} (${p.contributions})`).join('\n'),
);
