export const ok = (data: unknown) => ({
  statusCode: 200,
  body: JSON.stringify({ success: true, data }),
});

export const badRequest = (message: string) => ({
  statusCode: 400,
  body: JSON.stringify({ success: false, message }),
});

export const notFound = (message: string) => ({
  statusCode: 404,
  body: JSON.stringify({ success: false, message }),
});

export const serverError = (message: string) => ({
  statusCode: 500,
  body: JSON.stringify({ success: false, message }),
});
