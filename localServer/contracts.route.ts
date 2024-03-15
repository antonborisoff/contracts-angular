import {
  Request,
  Response
} from 'express'
import {
  CONTRACTS
} from './contracts'

let currentContracts = CONTRACTS

type Contract = typeof CONTRACTS[0]

export const contractRoutes = {
  getContracts: function (req: Request, res: Response): void {
    res.status(200).json(currentContracts)
  },
  getContract: function (req: Request, res: Response): void {
    const contractId = req.params['contractId']
    const contract = currentContracts.find((contract) => {
      return contract.id === contractId
    })
    if (contract) {
      res.status(200).json(contract)
    }
    else {
      res.status(404).end()
    }
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
  },
  updateContract: function (req: Request, res: Response): void {
    const contractId = req.params['contractId']
    const updatedContract = req.body
    const contractToUpdate = currentContracts.find((contract) => {
      return contract.id === contractId
    })
    if (contractToUpdate) {
      updateContract(contractToUpdate, updatedContract)
      res.status(200)
    }
    else {
      res.status(404)
    }
    res.end()
  }
}

function updateContract(contract: Contract, fieldsToUpdate: Partial<Omit<Contract, 'id'>>): void {
  Object.assign(contract, fieldsToUpdate)
}
