import { volatilidadHandler } from './handlers/volatilidad';
import { horarioMercadoHandler } from './handlers/horario-mercado';

const mensaje: string = 'Proyecto Node.js + TypeScript funcionando';

console.log(mensaje);

export const handler = async (event: { path?: string; [key: string]: unknown }) => {
  if (event.path?.startsWith('/volatilidad')) {
    return volatilidadHandler(event as never);
  }

  if (event.path?.startsWith('/horario-mercado') || event.path?.startsWith('/feriado')) {
    return horarioMercadoHandler(event as never);
  }

  return {
    statusCode: 404,
    body: JSON.stringify({ success: false, message: 'Ruta no encontrada' }),
  };
};