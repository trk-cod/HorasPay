import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';

const repo = process.env.GITHUB_REPOSITORY;
if (!process.env.GH_TOKEN || !repo) {
  console.log('Artefactos listos. Para publicar: define GH_TOKEN y GITHUB_REPOSITORY=propietario/repositorio, luego ejecuta npm run release.');
  process.exit(0);
}
if (!existsSync('release/SHA256SUMS.txt')) throw new Error('Falta SHA256SUMS.txt.');
const version = process.env.npm_package_version;
execFileSync('gh', ['release', 'create', `v${version}`, 'release/*', '--repo', repo, '--generate-notes', '--title', `HorasPay ${version}`], { stdio: 'inherit', shell: true });
