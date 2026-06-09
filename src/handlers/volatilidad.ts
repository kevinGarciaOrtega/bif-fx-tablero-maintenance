import * as service from '../services/volatilidad.service';
import { badRequest, notFound, ok, serverError } from '../utils/response.util';

type APIGatewayProxyEvent = {
  httpMethod?: string;
  path?: string;
  pathParameters?: { id?: string };
  body?: string;
};

type APIGatewayProxyResult = {
  statusCode: number;
  body: string;
};

const getPathId = (event: APIGatewayProxyEvent): number | null => {
  const rawId = event.pathParameters?.id ?? event.path?.match(/^\/volatilidad\/(\d+)$/i)?.[1];

  if (!rawId) {
    return null;
  }

  const id = Number.parseInt(rawId, 10);
  return Number.isNaN(id) ? null : id;
};

export const volatilidadHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const { httpMethod, body } = event;

  try {
    if (httpMethod === 'GET' && !getPathId(event)) {
      const data = await service.getAll();
      return ok(data);
    }

    if (httpMethod === 'PUT') {
      const id = getPathId(event);

      if (!id) {
        return badRequest('ID de volatilidad inválido');
      }

      const dto = JSON.parse(body || '{}');
      const data = await service.update(id, dto);
      return ok(data);
    }

    return badRequest('Método no permitido');
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error interno del servidor';

    if (message === 'NOT_FOUND') {
      return notFound('Variable de volatilidad no encontrada');
    }

    if (message.includes('PIPs') || message.includes('Estado')) {
      return badRequest(message);
    }

    return serverError('Error interno del servidor');
  }
};
