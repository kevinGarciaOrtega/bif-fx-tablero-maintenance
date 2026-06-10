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

export const horarioMercadoHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const { httpMethod, path, pathParameters, queryStringParameters, body } = event;

  try {
    if (httpMethod === 'GET' && path === '/horario-mercado') {
      return ok(await service.getAllHorarios());
    }

    if (httpMethod === 'PUT' && pathParameters?.id) {
      const dto = JSON.parse(body || '{}');
      const modUsuario = 0;
      return ok(await service.updateHorario(pathParameters.id, dto, modUsuario));
    }

    if (httpMethod === 'GET' && path === '/feriado') {
      const anio = Number.parseInt(queryStringParameters?.anio || String(new Date().getFullYear()), 10);
      return ok(await service.getFeriadosByAnio(Number.isNaN(anio) ? new Date().getFullYear() : anio));
    }

    if (httpMethod === 'POST' && path === '/feriado') {
      const dto = JSON.parse(body || '{}');
      const regUsuario = 0;
      return created(await service.createFeriado(dto, regUsuario));
    }

    if (httpMethod === 'DELETE' && pathParameters?.codFeriado) {
      return ok(await service.deleteFeriado(Number.parseInt(pathParameters.codFeriado, 10)));
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
