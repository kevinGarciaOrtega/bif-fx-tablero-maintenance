# bif-fx-tablero-maintenance

Proyecto Node.js + TypeScript para el módulo de Variable Volatilidad.

## Scripts

- `npm test`
- `npm start`
- `npm run build`

## Despliegue AWS

El workflow de GitHub Actions publica la función Lambda usando las variables secretas:

### API Gateway para consumo del frontend

Ejecuta esta opción después de desplegar la función Lambda:

PowerShell:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\deploy-api-gateway.ps1
```

Bash:

```bash
npm run deploy:api
```

Requiere:
- `AWS_REGION`
- `AWS_LAMBDA_FUNCTION_NAME`

La URL resultante tendrá este formato:

```text
https://<api-id>.execute-api.<region>.amazonaws.com/prod/volatilidad
```

- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_REGION`
- `AWS_LAMBDA_FUNCTION_NAME`
