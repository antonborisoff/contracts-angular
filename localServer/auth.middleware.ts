import {
  NextFunction,
  Request,
  Response
} from 'express'

export function checkAuth(req: Request, res: Response, next: NextFunction): void {
  if (req.originalUrl !== '/api/auth/login') {
    if (req.get('Auth-token')) {
      next()
    }
    else {
      res.status(403).end()
    }
  }
  else {
    next()
  }
}
