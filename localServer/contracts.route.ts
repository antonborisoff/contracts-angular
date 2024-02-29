import {
  Request,
  Response
} from 'express'
import {
  CONTRACTS
} from './contracts'

export const contractRoutes = {
  getContracts: function (req: Request, res: Response): void {
    res.status(200).json(CONTRACTS)
  }
}
