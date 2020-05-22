import React from 'react'
import {
  render,
  screen,
  within,
  wait,
  waitForElementToBeRemoved,
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import App from './App'
import { Watchlist } from '../types'

beforeEach(() => {
  jest.clearAllMocks()
  fetchMock.resetMocks()
})

describe('search + search results', () => {
  it('should search for a single stock', async () => {
    const searchTerm = 'TEST'
    const searchResult = [
      {
        symbol: searchTerm,
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
    ]

    fetchMock.mockResponses(
      // Fetch watchlist response
      [JSON.stringify({}), { status: 200 }],
      // Search stock response
      [JSON.stringify(searchResult), { status: 200 }]
    )

    render(<App />)

    userEvent.type(
      screen.getByPlaceholderText('enter a stock symbol'),
      searchTerm
    )
    userEvent.click(screen.getByText('Search'))

    expect(screen.getByPlaceholderText('enter a stock symbol')).toBeDisabled()
    expect(screen.getByText('Search')).toBeDisabled()

    expect(await screen.findByText(searchResult[0].name)).toBeVisible()

    expect(
      screen.getByPlaceholderText('enter a stock symbol')
    ).not.toBeDisabled()
    expect(screen.getByText('Search')).not.toBeDisabled()

    expect(fetch).toHaveBeenCalledTimes(2)
    expect(fetch).toHaveBeenNthCalledWith(1, '/watchlist/default-user')
    expect(fetch).toHaveBeenNthCalledWith(
      2,
      `/stock?symbol=${searchTerm.toUpperCase()}`
    )
  })

  it('should search for multiple stocks', async () => {
    const searchTerm = 'STOCK1,STOCK2'
    const searchResult = [
      {
        symbol: 'STOCK1',
        name: 'Test stock 1',
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
      {
        symbol: 'STOCK2',
        name: 'Test stock 2',
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
    ]

    fetchMock.mockResponses(
      // Fetch watchlist response
      [JSON.stringify({}), { status: 200 }],
      // Search stock response
      [JSON.stringify(searchResult), { status: 200 }]
    )

    render(<App />)

    userEvent.type(
      screen.getByPlaceholderText('enter a stock symbol'),
      searchTerm
    )
    userEvent.click(screen.getByText('Search'))

    expect(screen.getByPlaceholderText('enter a stock symbol')).toBeDisabled()
    expect(screen.getByText('Search')).toBeDisabled()

    expect(await screen.findByText(searchResult[0].name)).toBeVisible()
    expect(await screen.findByText(searchResult[1].name)).toBeVisible()

    expect(
      screen.getByPlaceholderText('enter a stock symbol')
    ).not.toBeDisabled()
    expect(screen.getByText('Search')).not.toBeDisabled()

    expect(fetch).toHaveBeenCalledTimes(2)
    expect(fetch).toHaveBeenNthCalledWith(1, '/watchlist/default-user')
    expect(fetch).toHaveBeenNthCalledWith(
      2,
      `/stock?symbol=${searchTerm.toUpperCase()}`
    )
  })

  it('should add a stock to the watchlist and clear the search', async () => {
    const searchTerm = 'TEST'
    const stock = {
      symbol: searchTerm,
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

    fetchMock.mockResponses(
      // Fetch watchlist response
      [JSON.stringify({}), { status: 200 }],
      // Search stock response
      [JSON.stringify([stock]), { status: 200 }],
      // Add to watchlist response
      [JSON.stringify(stock), { status: 200 }]
    )

    render(<App />)

    userEvent.type(
      screen.getByPlaceholderText('enter a stock symbol'),
      searchTerm
    )
    userEvent.click(screen.getByText('Search'))

    expect(screen.getByPlaceholderText('enter a stock symbol')).toBeDisabled()
    expect(screen.getByText('Search')).toBeDisabled()

    expect(await screen.findByText(stock.name)).toBeVisible()

    expect(
      screen.getByPlaceholderText('enter a stock symbol')
    ).not.toBeDisabled()
    expect(screen.getByText('Search')).not.toBeDisabled()

    userEvent.click(screen.getByText('Add to watchlist'))
    expect(screen.getByText('Add to watchlist')).toBeDisabled()

    expect(
      await screen.findByTestId(`watchlist-row-${stock.symbol}`)
    ).toBeVisible()

    expect(screen.queryByText('Add to watchlist')).not.toBeInTheDocument()
    expect(screen.getByPlaceholderText('enter a stock symbol')).toHaveValue('')

    expect(fetch).toHaveBeenCalledTimes(3)
    expect(fetch).toHaveBeenNthCalledWith(1, '/watchlist/default-user')
    expect(fetch).toHaveBeenNthCalledWith(
      2,
      `/stock?symbol=${searchTerm.toUpperCase()}`
    )
    expect(fetch).toHaveBeenNthCalledWith(
      3,
      `/watchlist/default-user/${stock.symbol}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(stock),
      }
    )
  })

  it('should prevent adding to the watchlist if already watching the stock', async () => {
    const searchTerm = 'TEST'
    const stock = {
      symbol: searchTerm,
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

    fetchMock.mockResponses(
      // Fetch watchlist response
      [
        JSON.stringify({
          [stock.symbol]: stock,
        }),
        { status: 200 },
      ],
      // Search stock response
      [JSON.stringify([stock]), { status: 200 }]
    )

    render(<App />)

    userEvent.type(
      screen.getByPlaceholderText('enter a stock symbol'),
      searchTerm
    )
    userEvent.click(screen.getByText('Search'))

    expect(screen.getByPlaceholderText('enter a stock symbol')).toBeDisabled()
    expect(screen.getByText('Search')).toBeDisabled()

    expect(await screen.findByText(stock.name)).toBeVisible()

    expect(
      screen.getByPlaceholderText('enter a stock symbol')
    ).not.toBeDisabled()
    expect(screen.getByText('Search')).not.toBeDisabled()

    expect(screen.getByText('Add to watchlist')).toBeDisabled()
    userEvent.click(screen.getByText('Add to watchlist'))

    expect(fetch).toHaveBeenCalledTimes(2)
  })

  it('should show an error if the search failed', async () => {
    const searchTerm = 'TEST'
    fetchMock.mockResponses(
      // Fetch watchlist response
      [JSON.stringify({}), { status: 200 }],
      // Search stock response
      ['Search error', { status: 500 }]
    )

    render(<App />)

    userEvent.type(
      screen.getByPlaceholderText('enter a stock symbol'),
      searchTerm
    )
    userEvent.click(screen.getByText('Search'))

    expect(
      await screen.findByText('An error occurred: Search error')
    ).toBeVisible()
  })

  it('should show an error if adding to watchlist failed', async () => {
    const searchTerm = 'TEST'
    const stock = {
      symbol: searchTerm,
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

    fetchMock.mockResponses(
      // Fetch watchlist response
      [JSON.stringify({}), { status: 200 }],
      // Search stock response
      [JSON.stringify([stock]), { status: 200 }],
      // Add to watchlist response
      ['Error adding to watchlist', { status: 500 }]
    )

    render(<App />)

    userEvent.type(
      screen.getByPlaceholderText('enter a stock symbol'),
      searchTerm
    )
    userEvent.click(screen.getByText('Search'))

    expect(await screen.findByText(stock.name)).toBeVisible()
    userEvent.click(screen.getByText('Add to watchlist'))

    expect(
      await screen.findByText('An error occurred: Error adding to watchlist')
    ).toBeVisible()
  })
})

describe('watchlist table', () => {
  it('should show the stocks in the watchlist', async () => {
    const watchlist = ['STOCK1', 'STOCK2', 'STOCK3'].reduce(
      (result, symbol) => {
        result[symbol] = {
          symbol,
          name: `Test ${symbol}`,
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
        return result
      },
      {} as Watchlist
    )

    fetchMock.mockResponse(JSON.stringify(watchlist))

    render(<App />)

    await wait(() => expect(fetch).toHaveBeenCalledTimes(1))

    Object.values(watchlist).forEach((stock) => {
      const { getByText } = within(
        screen.getByTestId(`watchlist-row-${stock.symbol}`)
      )
      expect(getByText(stock.symbol)).toBeVisible()
      expect(getByText(stock.price_open)).toBeVisible()
      expect(getByText(stock.close_yesterday)).toBeVisible()
      expect(getByText(stock.day_high)).toBeVisible()
      expect(getByText(stock.day_low)).toBeVisible()
      expect(getByText(stock.volume)).toBeVisible()
    })
  })

  it(`should refresh a stock's data`, async () => {
    const watchlist = {
      TEST: {
        symbol: 'TEST',
        name: `Test stock`,
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
    }

    const refreshedDayHigh = (
      parseFloat(watchlist.TEST.day_high) + 10
    ).toString()

    fetchMock.mockResponses(
      // Fetch watchlist response
      [JSON.stringify(watchlist), { status: 200 }],
      // Refresh stock response
      [
        JSON.stringify({
          ...watchlist.TEST,
          day_high: refreshedDayHigh,
        }),
        { status: 200 },
      ]
    )

    render(<App />)

    expect(await screen.findByText(watchlist.TEST.symbol)).toBeVisible()
    userEvent.click(screen.getByText('Refresh'))
    expect(await screen.findByText(refreshedDayHigh)).toBeVisible()

    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      `/watchlist/default-user/${watchlist.TEST.symbol}`,
      {
        method: 'PUT',
      }
    )
  })

  it(`should show an error if refreshing failed`, async () => {
    const watchlist = {
      TEST: {
        symbol: 'TEST',
        name: `Test stock`,
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
    }

    fetchMock.mockResponses(
      // Fetch watchlist response
      [JSON.stringify(watchlist), { status: 200 }],
      // Refresh stock response
      ['Error refreshing stock data', { status: 500 }]
    )

    render(<App />)

    expect(await screen.findByText(watchlist.TEST.symbol)).toBeVisible()
    userEvent.click(screen.getByText('Refresh'))
    expect(
      await screen.findByText('An error occurred: Refresh stock error')
    ).toBeVisible()

    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      `/watchlist/default-user/${watchlist.TEST.symbol}`,
      {
        method: 'PUT',
      }
    )
  })

  it(`should remove a stock`, async () => {
    const watchlist = {
      TEST: {
        symbol: 'TEST',
        name: `Test stock`,
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
    }

    fetchMock.mockResponses(
      // Fetch watchlist response
      [JSON.stringify(watchlist), { status: 200 }],
      // Remove stock response
      [JSON.stringify(watchlist.TEST), { status: 200 }]
    )

    render(<App />)

    expect(await screen.findByText(watchlist.TEST.symbol)).toBeVisible()
    userEvent.click(screen.getByText('Remove'))

    await waitForElementToBeRemoved(() =>
      screen.queryByTestId(`watchlist-row-${watchlist.TEST.symbol}`)
    )

    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      `/watchlist/default-user/${watchlist.TEST.symbol}`,
      {
        method: 'DELETE',
      }
    )
  })

  it(`should show an error if removing failed`, async () => {
    const watchlist = {
      TEST: {
        symbol: 'TEST',
        name: `Test stock`,
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
    }

    fetchMock.mockResponses(
      // Fetch watchlist response
      [JSON.stringify(watchlist), { status: 200 }],
      // Refresh stock response
      ['Error removing stock', { status: 500 }]
    )

    render(<App />)

    expect(await screen.findByText(watchlist.TEST.symbol)).toBeVisible()
    userEvent.click(screen.getByText('Remove'))

    expect(
      await screen.findByText('An error occurred: Remove stock error')
    ).toBeVisible()
    expect(screen.getByText(watchlist.TEST.symbol)).toBeVisible()

    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      `/watchlist/default-user/${watchlist.TEST.symbol}`,
      {
        method: 'DELETE',
      }
    )
  })

  it(`should show a stock's details`, async () => {
    const watchlist = {
      TEST: {
        symbol: 'TEST',
        name: `Test stock`,
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
        volume_avg: '35852882',
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
    }
    fetchMock.mockResponse(JSON.stringify(watchlist))

    render(<App />)

    userEvent.click(
      await screen.findByTestId(`watchlist-row-${watchlist.TEST.symbol}`)
    )

    const { getByText } = within(screen.getByRole('dialog'))
    expect(getByText(`Stock Details: ${watchlist.TEST.symbol}`)).toBeVisible()
    Object.entries(watchlist.TEST).forEach(([field, value]) => {
      expect(getByText(`${field}:`)).toBeVisible()
      expect(getByText(value)).toBeVisible()
    })
  })
})
