const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
import {
  Application
} from 'express'
import {
  authRoutes
} from './auth.route'
import {
  checkAuth
} from './auth.middleware'
import { contractRoutes } from './contracts.route'

const app: Application = express()

app.use(cors({
  origin: true
}))
app.use(bodyParser.json())

app.use(checkAuth)

app.route('/api/auth/login').post(authRoutes.login)
app.route('/api/auth/logout').post(authRoutes.logout)

app.route('/api/contracts').get(contractRoutes.getContracts)
app.route('/api/contracts/:contractId').delete(contractRoutes.deleteContract)

const port = 9000
app.listen(port, () => {
  console.log(`HTTP REST API Server running at http://localhost: ${port}`)
})
