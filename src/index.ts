import { volatilidadHandler } from './handlers/volatilidad';

const mensaje: string = 'Proyecto Node.js + TypeScript funcionando';

console.log(mensaje);

export const handler = async (event: { path?: string; [key: string]: unknown }) => {
  if (event.path?.startsWith('/volatilidad')) {
    return volatilidadHandler(event as never);
  }

  return {
    statusCode: 404,
    body: JSON.stringify({ success: false, message: 'Ruta no encontrada' }),
  };
};