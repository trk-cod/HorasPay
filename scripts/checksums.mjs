import { createHash } from 'node:crypto';
import { promises as fs } from 'node:fs';
import path from 'node:path';

const release = path.resolve('release');
const archivos = (await fs.readdir(release)).filter(x => /\.(exe|yml|blockmap)$/i.test(x)).sort();
const lineas = await Promise.all(archivos.map(async archivo => {
  const contenido = await fs.readFile(path.join(release, archivo));
  return `${createHash('sha256').update(contenido).digest('hex')}  ${archivo}`;
}));
await fs.writeFile(path.join(release, 'SHA256SUMS.txt'), `${lineas.join('\n')}\n`);
console.log(`SHA256SUMS.txt creado para ${archivos.length} artefactos.`);
