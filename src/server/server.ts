import express from 'express'
import bodyParser from 'body-parser'
import axios from 'axios'

import { Watchlist, Stock } from '../types'

interface Database {
  [userId: string]: Watchlist
}

export const defaultSymbols = ['SPY', 'DJI', 'RUS', 'NDX', 'TSLA']

// export const API_TOKEN =
//   'urHaQsmtZPMJ8PGc67sm0RfzYNA4KDorSRCo0aN4Rjv8bNWDaJLGk8FINeKf'
export const API_TOKEN =
  'uHqPgKsjTR0h43dmXCZnjhdXccW4jDKuHjpIhkvS8bRnDsr6YLoVAWWZmhF6'

async function fetchStockData(symbols: string[]) {
  const response = await axios.get<{
    symbols_requested: number
    symbols_returned: number
    data: Omit<Stock, 'lastUpdated'>[]
  }>(
    `https://api.worldtradingdata.com/api/v1/stock?symbol=${symbols.join(
      ','
    )}&api_token=${API_TOKEN}`
  )

  if (!response.data.data) {
    console.error(response.data)
    throw new Error(`Failed to fetch stock data for ${symbols.join(',')}`)
  }

  return response.data.data.map((stockData) => ({
    ...stockData,
    lastUpdated: Date.now(),
  }))
}

export default function createServer(db: Database) {
  const app = express()
  app.use(bodyParser.json())

  app.get<{ userId: string }, Watchlist>(
    '/watchlist/:userId',
    async (req, res) => {
      try {
        if (!db[req.params.userId]) {
          const stocksData = await fetchStockData(defaultSymbols)
          const initialWatchList = stocksData.reduce((watchlist, stock) => {
            watchlist[stock.symbol] = stock
            return watchlist
          }, {} as Watchlist)

          // Requirement to have default symbols in the watchlist
          // despite no stock data for some.
          for (const symbol of defaultSymbols) {
            if (!initialWatchList[symbol]) {
              initialWatchList[symbol] = {
                symbol,
                name: null,
                currency: null,
                price: null,
                price_open: null,
                day_high: null,
                day_low: null,
                '52_week_high': null,
                '52_week_low': null,
                day_change: null,
                change_pct: null,
                close_yesterday: null,
                market_cap: null,
                volume: null,
                volume_avg: null,
                shares: null,
                stock_exchange_long: null,
                stock_exchange_short: null,
                timezone: null,
                timezone_name: null,
                gmt_offset: null,
                last_trade_time: null,
                pe: null,
                eps: null,
                lastUpdated: Date.now(),
              }
            }

            db[req.params.userId] = initialWatchList
          }
        }

        return res.json(db[req.params.userId])
      } catch (error) {
        return res
          .status(error?.response?.status ?? 500)
          .json(error?.response?.data ?? error.message)
      }
    }
  )

  app.delete<{ userId: string; symbol: string }, Stock | string>(
    '/watchlist/:userId/:symbol',
    (req, res) => {
      if (!db[req.params.userId]) {
        return res
          .status(404)
          .json(`No watchlist found for user ${req.params.userId}`)
      }

      const { [req.params.symbol]: removedStock, ...restOfWatchlist } = db[
        req.params.userId
      ]
      db[req.params.userId] = restOfWatchlist

      return res.json(removedStock)
    }
  )

  app.put<{ userId: string; symbol: string }, Stock | string>(
    '/watchlist/:userId/:symbol',
    async (req, res) => {
      if (!db[req.params.userId]) {
        return res
          .status(404)
          .json(`No watchlist found for user ${req.params.userId}`)
      }

      try {
        const [updatedStockData] = await fetchStockData([req.params.symbol])
        db[req.params.userId][req.params.symbol] = updatedStockData

        return res.json(db[req.params.userId][req.params.symbol])
      } catch (error) {
        return res
          .status(error?.response?.status ?? 500)
          .json(error?.response?.data ?? error.message)
      }
    }
  )

  app.post<{ userId: string; symbol: string }, Stock | string, Required<Stock>>(
    '/watchlist/:userId/:symbol',
    (req, res) => {
      if (!db[req.params.userId]) {
        return res
          .status(404)
          .json(`No watchlist found for user ${req.params.userId}`)
      }

      db[req.params.userId][req.params.symbol] = req.body

      return res.json(db[req.params.userId][req.params.symbol])
    }
  )

  app.get('/stock', async (req, res) => {
    if (!req.query.symbol) {
      return res.status(400).json('No stock symbols provided')
    }

    try {
      const symbols = Array.isArray(req.query.symbol)
        ? req.query.symbol
        : (req.query.symbol as string).split(',')

      const stockData = await fetchStockData(symbols as string[])

      return res.json(stockData)
    } catch (error) {
      return res
        .status(error?.response?.status ?? 500)
        .json(error?.response?.data ?? error.message)
    }
  })

  return app
}
