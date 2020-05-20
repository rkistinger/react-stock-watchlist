import request from 'supertest'
import axios from 'axios'

import createServer from './server'

jest.mock('axios', () => ({
  get: jest.fn(),
}))

beforeEach(() => {
  jest.clearAllMocks()
})

describe('get watchlist', () => {
  it('should 404 if no watchlist exists', async () => {
    const userId = 'test-user'
    const server = createServer({})

    const res = await request(server).get(`/watchlist/${userId}`)

    expect(res.status).toBe(404)
    expect(res.body).toBe(`No watchlist found for user ID ${userId}`)
  })

  it(`should return the user's watchlist`, async () => {
    const userId = 'test-user'
    const server = createServer({
      [userId]: ['TEST'],
    })

    const res = await request(server).get(`/watchlist/${userId}`)

    expect(res.status).toBe(200)
    expect(res.body).toEqual(['TEST'])
  })
})

describe('add symbol', () => {
  it(`should initialize a new user's watchlist`, async () => {
    const userId = 'test-user'
    const server = createServer({})

    const res = await request(server).put(`/watchlist/${userId}`).send(['TEST'])

    expect(res.status).toBe(200)
    expect(res.body).toEqual(['TEST'])
  })

  it(`should update an existing user's watchlist`, async () => {
    const userId = 'test-user'
    const server = createServer({
      [userId]: ['TEST'],
    })

    const res = await request(server).put(`/watchlist/${userId}`).send(['NEW'])

    expect(res.status).toBe(200)
    expect(res.body).toEqual(['TEST', 'NEW'])
  })

  it('should not add duplicate symbols to a watchlist', async () => {
    const userId = 'test-user'
    const server = createServer({
      [userId]: ['TEST'],
    })

    const res = await request(server).put(`/watchlist/${userId}`).send(['TEST'])

    expect(res.status).toBe(200)
    expect(res.body).toEqual(['TEST'])
  })
})

describe('remove symbol', () => {
  it('should 404 if no watchlist exists', async () => {
    const userId = 'test-user'
    const symbol = 'TEST'
    const server = createServer({})

    const res = await request(server).delete(`/watchlist/${userId}/${symbol}`)

    expect(res.status).toBe(404)
    expect(res.body).toBe(`No watchlist found for user ID ${userId}`)
  })

  it(`should remove symbol from user's watchlist and return it`, async () => {
    const userId = 'test-user'
    const symbol = 'TEST'
    const db = {
      [userId]: [symbol, 'OTHER'],
    }
    const server = createServer(db)

    const res = await request(server).delete(`/watchlist/${userId}/${symbol}`)

    expect(res.status).toBe(200)
    expect(res.body).toBe(symbol)
    expect(db[userId]).toEqual(['OTHER'])
  })
})

describe('get stock data', () => {
  it('should 400 if no symbols are provided', async () => {
    const server = createServer({})

    const res = await request(server).get('/stock')

    expect(res.status).toBe(400)
    expect(res.body).toBe('No stock symbols provided')
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
      `https://api.worldtradingdata.com/api/v1/stock?api_token=urHaQsmtZPMJ8PGc67sm0RfzYNA4KDorSRCo0aN4Rjv8bNWDaJLGk8FINeKfsymbol=${symbol}`
    )
    expect(res.status).toBe(200)
    expect(res.body).toEqual(mockResponse)
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

    const res = await request(server).get(`/stock?symbol=TEST&symbol=OTHER`)

    expect(axios.get as jest.Mock).toHaveBeenCalledTimes(1)
    expect(axios.get as jest.Mock).toHaveBeenCalledWith(
      `https://api.worldtradingdata.com/api/v1/stock?api_token=urHaQsmtZPMJ8PGc67sm0RfzYNA4KDorSRCo0aN4Rjv8bNWDaJLGk8FINeKfsymbol=TEST,OTHER`
    )
    expect(res.status).toBe(200)
    expect(res.body).toEqual(mockResponse)
  })
})
