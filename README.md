# bif-fx-tablero-maintenance

Proyecto Node.js + TypeScript para el módulo de Variable Volatilidad.

## Scripts

- `npm test`
- `npm start`
- `npm run build`

## Despliegue AWS

El workflow de GitHub Actions publica la función Lambda usando las variables secretas:

- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_REGION`
- `AWS_LAMBDA_FUNCTION_NAME`
