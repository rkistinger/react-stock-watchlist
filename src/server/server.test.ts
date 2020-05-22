import request from 'supertest'
import axios from 'axios'

import createServer, { API_TOKEN, defaultSymbols } from './server'
import { Watchlist } from '../types'

jest.mock('axios', () => ({
  get: jest.fn(),
}))

beforeEach(() => {
  jest.clearAllMocks()
})

describe('get watchlist', () => {
  it('should create and return the default watchlist for a new user', async () => {
    const userId = 'test-user'
    const db = {}
    const server = createServer(db)
    const mockResponse = {
      symbols_requested: 5,
      symbols_returned: 1,
      data: [
        {
          symbol: 'SPY',
          name: 'SPY',
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
        },
      ],
    }
    ;(axios.get as jest.Mock).mockResolvedValue({
      data: mockResponse,
    })

    const res = await request(server).get(`/watchlist/${userId}`)

    expect(res.status).toBe(200)
    expect(res.body).toEqual({
      ...defaultSymbols.reduce((watchlist, symbol) => {
        watchlist[symbol] = {
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
        return watchlist
      }, {} as Watchlist),
      SPY: mockResponse.data[0],
    })

    expect(axios.get as jest.Mock).toHaveBeenCalledTimes(1)
    expect(axios.get as jest.Mock).toHaveBeenCalledWith(
      `https://api.worldtradingdata.com/api/v1/stock?symbol=${defaultSymbols.join(
        ','
      )}&api_token=${API_TOKEN}`
    )
  })

  it(`should return an existing user's watchlist`, async () => {
    const userId = 'test-user'
    const db = {
      [userId]: {
        SPY: {
          symbol: 'SPY',
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
        },
      },
    }
    const server = createServer(db)

    const res = await request(server).get(`/watchlist/${userId}`)

    expect(res.status).toBe(200)
    expect(res.body).toEqual(db[userId])
  })
})

describe('remove stock', () => {
  it('should 404 if user has no watchlist', async () => {
    const userId = 'test-user'
    const symbol = 'TEST'
    const db = {}
    const server = createServer(db)

    const res = await request(server).delete(`/watchlist/${userId}/${symbol}`)

    expect(res.status).toBe(404)
    expect(res.body).toBe(`No watchlist found for user ${userId}`)
  })

  it(`should remove stock from user's watchlist and return it`, async () => {
    const userId = 'test-user'
    const symbol = 'SPY'
    const db = {
      [userId]: {
        [symbol]: {
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
        },
      },
    }
    const server = createServer(db)

    const res = await request(server).delete(`/watchlist/${userId}/${symbol}`)

    expect(res.status).toBe(200)
    expect(res.body).toEqual({
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
    })
    expect(db[userId]).toEqual({})
  })
})

describe('refresh (update) stock', () => {
  it('should 404 if user has no watchlist', async () => {
    const userId = 'test-user'
    const symbol = 'TEST'
    const db = {}
    const server = createServer(db)

    const res = await request(server).put(`/watchlist/${userId}/${symbol}`)

    expect(res.status).toBe(404)
    expect(res.body).toBe(`No watchlist found for user ${userId}`)
  })

  it('should update the users watchlist with the latest stock data and return the stock data', async () => {
    const userId = 'test-user'
    const symbol = 'TEST'
    const db = {
      [userId]: {
        [symbol]: {
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
        },
      },
    }
    const server = createServer(db)

    const mockResponse = {
      symbols_requested: 1,
      symbols_returned: 1,
      data: [
        {
          symbol,
          name: 'Test stock',
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
        },
      ],
    }
    ;(axios.get as jest.Mock).mockResolvedValue({
      data: mockResponse,
    })

    const res = await request(server).put(`/watchlist/${userId}/${symbol}`)

    expect(res.status).toBe(200)
    expect(res.body).toEqual(mockResponse.data[0])
    expect(db[userId][symbol]).toEqual(mockResponse.data[0])
    expect(axios.get as jest.Mock).toHaveBeenCalledTimes(1)
    expect(axios.get as jest.Mock).toHaveBeenCalledWith(
      `https://api.worldtradingdata.com/api/v1/stock?symbol=${symbol}&api_token=${API_TOKEN}`
    )
  })
})

describe('add symbol', () => {
  it('should 404 if user has no watchlist', async () => {
    const userId = 'test-user'
    const symbol = 'TEST'
    const db = {}
    const server = createServer(db)

    const res = await request(server).post(`/watchlist/${userId}/${symbol}`)

    expect(res.status).toBe(404)
    expect(res.body).toBe(`No watchlist found for user ${userId}`)
  })

  it(`should add to an existing user's watchlist`, async () => {
    const userId = 'test-user'
    const symbol = 'TEST'
    const db = {
      [userId]: {
        SPY: {
          symbol: 'SPY',
          name: 'SPY',
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
        },
      },
    }
    const server = createServer(db)

    const requestBody = {
      symbol,
      name: 'Test stock',
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
    }
    const res = await request(server)
      .post(`/watchlist/${userId}/${symbol}`)
      .send(requestBody)

    expect(res.status).toBe(200)
    expect(res.body).toEqual(requestBody)
    expect(db[userId]).toEqual({
      ...db[userId],
      [symbol]: requestBody,
    })
  })
})

describe('get stock data', () => {
  it('should 400 if no symbols are provided', async () => {
    const server = createServer({})

    const res = await request(server).get('/stock')

    expect(res.status).toBe(400)
    expect(res.body).toBe('No stock symbols provided')
  })

  it('should 500 if no stock data is returned', async () => {
    const server = createServer({})
    const symbol = 'INVALID'
    ;(axios.get as jest.Mock).mockResolvedValue({
      data: {
        message: 'testing stock api error',
      },
    })

    const res = await request(server).get(`/stock?symbol=${symbol}`)

    expect(axios.get as jest.Mock).toHaveBeenCalledTimes(1)
    expect(axios.get as jest.Mock).toHaveBeenCalledWith(
      `https://api.worldtradingdata.com/api/v1/stock?symbol=${symbol}&api_token=${API_TOKEN}`
    )
    expect(res.status).toBe(500)
    expect(res.body).toEqual('Failed to fetch stock data')
  })

  it('should fetch data for a single stock', async () => {
    const server = createServer({})
    const symbol = 'TEST'
    const mockResponse = {
      symbols_requested: 1,
      symbols_returned: 1,
      data: [
        {
          symbol,
        },
      ],
    }
    ;(axios.get as jest.Mock).mockResolvedValue({
      data: mockResponse,
    })

    const res = await request(server).get(`/stock?symbol=${symbol}`)

    expect(axios.get as jest.Mock).toHaveBeenCalledTimes(1)
    expect(axios.get as jest.Mock).toHaveBeenCalledWith(
      `https://api.worldtradingdata.com/api/v1/stock?symbol=${symbol}&api_token=${API_TOKEN}`
    )
    expect(res.status).toBe(200)
    expect(res.body).toEqual(mockResponse.data)
  })

  it('should fetch data for multiple stocks', async () => {
    const server = createServer({})
    const mockResponse = {
      symbols_requested: 2,
      symbols_returned: 2,
      data: [
        {
          symbol: 'TEST',
        },
        {
          symbol: 'OTHER',
        },
      ],
    }
    ;(axios.get as jest.Mock).mockResolvedValue({
      data: mockResponse,
    })

    const res = await request(server).get(`/stock?symbol=TEST,OTHER`)

    expect(axios.get as jest.Mock).toHaveBeenCalledTimes(1)
    expect(axios.get as jest.Mock).toHaveBeenCalledWith(
      `https://api.worldtradingdata.com/api/v1/stock?symbol=TEST,OTHER&api_token=${API_TOKEN}`
    )
    expect(res.status).toBe(200)
    expect(res.body).toEqual(mockResponse.data)
  })
})
