import {
  Request,
  Response
} from 'express'
import {
  USERS
} from './users'

export const authRoutes = {
  login: function login(req: Request, res: Response): void {
    const validUser = USERS.some((user) => {
      return user.login === req.body.login && user.password === req.body.password
    })
    if (validUser) {
      res.status(200)
    }
    else {
      res.status(403)
    }
    res.end()
  }
}
