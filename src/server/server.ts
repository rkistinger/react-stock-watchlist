import express from 'express'
import bodyParser from 'body-parser'
import axios from 'axios'

import { StockSymbol, Watchlist } from '../types'

interface Database {
  [userId: string]: Watchlist
}

export default function createServer(db: Database) {
  const app = express()
  app.use(bodyParser.json())

  app.get<{ userId: string }, string | Watchlist>(
    '/watchlist/:userId',
    (req, res) => {
      const watchlist = db[req.params.userId]

      if (!watchlist) {
        return res
          .status(404)
          .json(`No watchlist found for user ID ${req.params.userId}`)
      }

      return res.json(watchlist)
    }
  )

  app.put<{ userId: string }, string | Watchlist, StockSymbol[]>(
    '/watchlist/:userId',
    (req, res) => {
      if (!db[req.params.userId]) {
        db[req.params.userId] = []
      }

      const dedupedSymbols = Array.from(
        new Set([...db[req.params.userId], ...req.body])
      )
      db[req.params.userId] = dedupedSymbols

      return res.json(db[req.params.userId])
    }
  )

  app.delete<{ userId: string; symbol: string }, string | StockSymbol>(
    '/watchlist/:userId/:symbol',
    (req, res) => {
      if (!db[req.params.userId]) {
        return res
          .status(404)
          .json(`No watchlist found for user ID ${req.params.userId}`)
      }

      const removeIndex = db[req.params.userId].indexOf(req.params.symbol)
      const [removedSymbol] = db[req.params.userId].splice(removeIndex, 1)

      return res.json(removedSymbol)
    }
  )

  app.get('/stock', async (req, res) => {
    if (!req.query.symbol) {
      return res.status(400).json('No stock symbols provided')
    }

    try {
      const symbols = Array.isArray(req.query.symbol)
        ? req.query.symbol
        : [req.query.symbol]
      const response = await axios.get(
        `https://api.worldtradingdata.com/api/v1/stock?api_token=urHaQsmtZPMJ8PGc67sm0RfzYNA4KDorSRCo0aN4Rjv8bNWDaJLGk8FINeKfsymbol=${symbols.join(
          ','
        )}`
      )

      return res.json(response.data)
    } catch (error) {
      return res
        .status(error?.response.status ?? 500)
        .json(error?.response.data ?? error.message)
    }
  })

  return app
}
