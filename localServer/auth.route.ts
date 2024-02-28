import {
  Request,
  Response
} from 'express'
import {
  USERS
} from './users'
import {
  ACTIVE_FEATURES
} from './activeFeatures'

export const authRoutes = {
  login: function (req: Request, res: Response): void {
    const user = USERS.find((user) => {
      return user.login === req.body.login && user.password === req.body.password
    })
    if (user) {
      res.status(200).json({
        token: user.token,
        activeFeatures: ACTIVE_FEATURES
      })
    }
    else {
      res.status(403).end()
    }
  },
  logout: function (req: Request, res: Response): void {
    res.status(200)
    res.end()
  }
}
