import type { Request, Response, NextFunction } from 'express';

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  const status = 500;
  res.status(status).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
}
