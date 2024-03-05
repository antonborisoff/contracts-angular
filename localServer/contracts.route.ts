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
  },
  createContract: function (req: Request, res: Response): void {
    const contract = req.body
    contract.id = `contract_${Math.floor(Math.random() * 10000)}`
    currentContracts.push(contract)
    res.status(200).json({
      id: contract.id
    })
  }
}
