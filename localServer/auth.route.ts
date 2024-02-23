import {
  Request,
  Response
} from 'express'
import {
  USERS
} from './users'

export const authRoutes = {
  login: function (req: Request, res: Response): void {
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
  },
  logout: function (req: Request, res: Response): void {
    res.status(200)
    res.end()
  }
}
