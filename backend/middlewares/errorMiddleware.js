import { sendError } from '../utils/apiResponse.js';

export const notFound = (req, res, next) => {
  sendError(res, `Route not found: ${req.originalUrl}`, 404);
};

export const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  sendError(res, err.message || 'Internal Server Error', statusCode, process.env.NODE_ENV === 'development' ? err.stack : null);
};
