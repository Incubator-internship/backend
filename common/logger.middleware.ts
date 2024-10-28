import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

// https://docs.nestjs.com/middleware
@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl, headers } = req;
    const timestamp = new Date().toISOString();
    console.log(
      `[${timestamp}] ${method} ${originalUrl} - Headers: ${JSON.stringify(headers)}`,
    );

    res.on('finish', () => {
      console.log(`[INFO] [${timestamp}] ${res.statusCode} ${originalUrl}`);
    });

    next();
  }
}

// Функциональный middleware
// https://docs.nestjs.com/middleware#functional-middleware
export const LoggerMiddlewareFunc = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.log('Request... LoggerMiddlewareFunc');
  next();
};
