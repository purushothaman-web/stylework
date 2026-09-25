import type { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export function errorHandler(
  err: Error | AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  const isAppError =
    err instanceof AppError ||
    ('statusCode' in err && typeof err.statusCode === 'number' && 'isOperational' in err);

  const statusCode = isAppError ? (err as AppError).statusCode : 500;
  const message = isAppError ? err.message : 'Internal Server Error';

  if (!isAppError) {
    console.error('Unhandled Server Error:', err);
  }

  res.status(statusCode).json({
    success: false,
    message,
  });
}
