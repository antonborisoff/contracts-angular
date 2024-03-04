import {
  Request,
  Response
} from 'express'
import {
  CONTRACTS
} from './contracts'

let currentContracts = CONTRACTS

export const contractRoutes = {
  getContracts: function (req: Request, res: Response): void {
    res.status(200).json(currentContracts)
  },
  deleteContract: function (req: Request, res: Response): void {
    const contractId = req.params['contractId']
    currentContracts = currentContracts.filter((contract) => {
      return contract.id !== contractId
    })
    res.status(200).end()
  }
}
