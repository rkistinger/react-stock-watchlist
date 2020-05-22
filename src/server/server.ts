import express from 'express'
import bodyParser from 'body-parser'
import axios from 'axios'

import { Watchlist, Stock } from '../types'

interface Database {
  [userId: string]: Watchlist
}

const IS_MOCKED = false

export const defaultSymbols = ['SPY', 'DJI', 'RUS', 'NDX', 'TSLA']

// export const API_TOKEN =
//   'urHaQsmtZPMJ8PGc67sm0RfzYNA4KDorSRCo0aN4Rjv8bNWDaJLGk8FINeKf'
export const API_TOKEN =
  'uHqPgKsjTR0h43dmXCZnjhdXccW4jDKuHjpIhkvS8bRnDsr6YLoVAWWZmhF6'

async function fetchStockData(symbols: string[]): Promise<Stock[]> {
  if (IS_MOCKED) {
    const mockResponse = {
      symbols_requested: symbols.length,
      symbols_returned: symbols.length,
      data: symbols.map((symbol) => ({
        symbol,
        name: 'Snap Inc',
        currency: 'USD',
        price: '11.06',
        price_open: Date.now().toString(),
        day_high: '11.45',
        day_low: '10.85',
        '52_week_high': '19.75',
        '52_week_low': '7.89',
        day_change: '0.24',
        change_pct: '0.21',
        close_yesterday: '11.27',
        market_cap: '15352254464',
        volume: '36852882',
        volume_avg: '36852882',
        shares: '15779962',
        stock_exchange_long: 'New York Stock Exchange',
        stock_exchange_short: 'NYSE',
        timezone: 'EDT',
        timezone_name: 'America/New_York',
        gmt_offset: '-14400',
        last_trade_time: '2020-04-04 16:04:51',
        pe: 'N/A',
        eps: '-0.75',
      })),
    }
    return mockResponse.data
  } else {
    const response = await axios.get(
      `https://api.worldtradingdata.com/api/v1/stock?symbol=${symbols.join(
        ','
      )}&api_token=${API_TOKEN}`
    )

    if (!response.data.data) {
      console.error(response.data)
      throw new Error(`Failed to fetch stock data for ${symbols.join(',')}`)
    }

    return response.data.data
  }
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

  app.post<{ userId: string; symbol: string }, Stock | string, Stock>(
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
