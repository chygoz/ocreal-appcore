import { RequestHandler, Request, Response, NextFunction } from 'express';

export default function (async_handler: RequestHandler) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await async_handler(req, res, next);
    } catch (e: any) {
      if (e.status_code != 422) {
        console.log(e);
      }

      next(e);
    }
  };
}
