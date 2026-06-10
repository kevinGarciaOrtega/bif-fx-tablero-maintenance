import { volatilidadHandler } from './handlers/volatilidad';
import { horarioMercadoHandler } from './handlers/horario-mercado';

// Handler genérico (fallback con routing por path)
export const handler = async (event: { path?: string; [key: string]: unknown }) => {
  const path = event.path ?? '';

  if (path.includes('volatilidad')) {
    return volatilidadHandler(event as never);
  }

  if (path.includes('horario-mercado') || path.includes('feriado')) {
    return horarioMercadoHandler(event as never);
  }

  return {
    statusCode: 404,
    body: JSON.stringify({ success: false, message: 'Ruta no encontrada' }),
  };
};

// Handlers individuales exportados para cada Lambda dedicada
export const listarVolatilidad = async (event: unknown) =>
  volatilidadHandler(event as never);

export const actualizarVolatilidad = async (event: unknown) =>
  volatilidadHandler(event as never);