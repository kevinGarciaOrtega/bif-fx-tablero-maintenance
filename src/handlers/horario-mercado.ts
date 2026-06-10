import * as service from '../services/horario-mercado.service';
import { badRequest, created, notFound, ok, serverError } from '../utils/response.util';

type APIGatewayProxyEvent = {
  httpMethod?: string;
  path?: string;
  pathParameters?: { id?: string; codFeriado?: string };
  queryStringParameters?: Record<string, string | undefined>;
  body?: string;
};

type APIGatewayProxyResult = {
  statusCode: number;
  body: string;
};

const getPathId = (event: APIGatewayProxyEvent): string | null => {
  return event.pathParameters?.id ?? event.path?.match(/\/horario-mercado\/([^/]+)$/i)?.[1] ?? null;
};

const getPathCodFeriado = (event: APIGatewayProxyEvent): string | null => {
  return event.pathParameters?.codFeriado ?? event.path?.match(/\/feriado\/([^/]+)$/i)?.[1] ?? null;
};

export const horarioMercadoHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const { httpMethod, path, pathParameters, queryStringParameters, body } = event;

  try {
    const routingEvent = {
      httpMethod: httpMethod ?? '',
      path: path ?? '',
      pathParameters: pathParameters ?? {},
      queryStringParameters: queryStringParameters ?? {},
      body: body ?? '',
    };
    const currentPath = routingEvent.path;

    if (httpMethod === 'GET' && currentPath.includes('/horario-mercado') && !currentPath.includes('/horario-mercado/')) {
      return ok(await service.getAllHorarios());
    }

    if (httpMethod === 'PUT' && currentPath.includes('/horario-mercado')) {
      const id = getPathId(routingEvent);
      if (!id) {
        return badRequest('ID de horario inválido');
      }

      const dto = JSON.parse(body || '{}');
      const modUsuario = 0;
      return ok(await service.updateHorario(id, dto, modUsuario));
    }

    if (httpMethod === 'GET' && currentPath.includes('/feriado') && !currentPath.includes('/feriado/')) {
      const anio = Number.parseInt(queryStringParameters?.anio || String(new Date().getFullYear()), 10);
      return ok(await service.getFeriadosByAnio(Number.isNaN(anio) ? new Date().getFullYear() : anio));
    }

    if (httpMethod === 'POST' && currentPath.includes('/feriado')) {
      const dto = JSON.parse(body || '{}');
      const regUsuario = 0;
      return created(await service.createFeriado(dto, regUsuario));
    }

    if (httpMethod === 'DELETE' && currentPath.includes('/feriado')) {
      const codFeriado = getPathCodFeriado(routingEvent);
      if (!codFeriado) {
        return badRequest('ID de feriado inválido');
      }

      return ok(await service.deleteFeriado(Number.parseInt(codFeriado, 10)));
    }

    return badRequest('Ruta no encontrada');
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error interno del servidor';

    if (message === 'NOT_FOUND') {
      return notFound('Registro no encontrado');
    }

    if (message.includes('PIPs') || message.includes('Horario') || message.includes('fecha') || message.includes('Ya existe') || message.includes('Formato')) {
      return badRequest(message);
    }

    console.error('Error:', error);
    return serverError('Error interno del servidor');
  }
};
