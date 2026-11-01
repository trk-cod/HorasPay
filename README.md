# HorasPay

Aplicación de escritorio Windows para registrar jornadas, calcular pagos y revisar resúmenes personales.

## Desarrollo

Requisitos: .NET SDK 8 (runtime), Node.js 24+, npm y Docker Desktop solo para PostgreSQL opcional.

```powershell
npm install
docker compose up -d db             # opcional: PostgreSQL
npm run desktop:dev                 # SQLite local por defecto
```

Pruebas y compilación:

```powershell
npm test
dotnet test HorasPay.slnx
npm run web:build
```

## Distribución

`npm run release` compila Angular, publica la API .NET autocontenida, crea instalador NSIS y portable, y genera `SHA256SUMS.txt` en `release/`.

Para publicar un release, define `GITHUB_REPOSITORY=propietario/repositorio` y `GH_TOKEN` como variables de entorno. Antes de publicar, sustituye `CAMBIAR_OWNER` y `CAMBIAR_REPO` en `package.json` y `docs/descarga/index.html`.

La firma de código queda preparada para `CSC_LINK` y `CSC_KEY_PASSWORD` cuando se cuente con certificado.
