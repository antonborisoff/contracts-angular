import {
  NextFunction,
  Request,
  Response
} from 'express'

export function delay(req: Request, res: Response, next: NextFunction): void {
  setTimeout(next, 1000)
}
