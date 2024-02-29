import {
  NextFunction,
  Request,
  Response
} from 'express'
import {
  USERS
} from './users'

export function checkAuth(req: Request, res: Response, next: NextFunction): void {
  if (req.originalUrl !== '/api/auth/login') {
    const token = req.get('Auth-token')
    const valid = USERS.some((user) => {
      return user.token === token
    })
    if (valid) {
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
