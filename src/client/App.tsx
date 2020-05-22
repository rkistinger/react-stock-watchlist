import React from 'react'

import { Fetchable, Watchlist, Stock } from '../types'
import Search from './Search'
import SearchResult from './SearchResult'
import WatchlistTable from './WatchlistTable'

function App() {
  const [searchTerm, setSearchTerm] = React.useState('')
  const [searchResults, setSearchResults] = React.useState<
    Fetchable<Stock[] | undefined>
  >({
    status: 'idle',
    data: undefined,
  })
  const [watchlist, setWatchlist] = React.useState<Fetchable<Watchlist>>({
    status: 'loading',
    data: {},
  })
  const watchlistDataRef = React.useRef(watchlist.data)
  watchlistDataRef.current = watchlist.data

  React.useEffect(() => {
    async function getWatchlist() {
      try {
        const watchlistResponse = await fetch('/watchlist/default-user')

        if (!watchlistResponse.ok) {
          throw new Error('Error fetching watchlist')
        }

        const watchlist: Watchlist = await watchlistResponse.json()
        setWatchlist({
          status: 'idle',
          data: watchlist,
        })
      } catch (error) {
        setWatchlist({
          status: 'error',
          data: watchlistDataRef.current,
          message: error.message,
        })
      }
    }

    getWatchlist()
  }, [])

  async function search() {
    setSearchResults({
      status: 'loading',
      data: searchResults.data,
    })

    try {
      const res = await fetch(`/stock?symbol=${searchTerm.toUpperCase()}`)

      if (!res.ok) {
        throw new Error('Search error')
      }

      const json: Stock[] = await res.json()
      setSearchResults({
        status: 'idle',
        data: json,
      })
    } catch (error) {
      setSearchResults({
        status: 'error',
        data: searchResults.data,
        message: error.message,
      })
    }
  }

  async function addStockToWatchlist(stock: Stock) {
    setSearchResults({
      status: 'loading',
      data: searchResults.data,
    })

    try {
      const res = await fetch(`/watchlist/default-user/${stock.symbol}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(stock),
      })

      if (!res.ok) {
        throw new Error(`Error adding to watchlist`)
      }

      const json: Stock = await res.json()

      setSearchTerm('')
      setSearchResults({
        status: 'idle',
        data: undefined,
      })
      setWatchlist({
        status: 'idle',
        data: {
          ...watchlist.data,
          [json.symbol]: json,
        },
      })
    } catch (error) {
      setSearchResults({
        status: 'error',
        data: searchResults.data,
        message: error.message,
      })
    }
  }

  async function removeStock(symbol: string) {
    setWatchlist({
      status: 'loading',
      data: watchlist.data,
    })
    try {
      const res = await fetch(`/watchlist/default-user/${symbol}`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        throw new Error('Remove stock error')
      }

      const { [symbol]: removedStock, ...restOfWatchlist } = watchlist.data
      setWatchlist({
        status: 'idle',
        data: restOfWatchlist,
      })
    } catch (error) {
      setWatchlist({
        status: 'error',
        data: watchlist.data,
        message: error.message,
      })
    }
  }

  async function refreshStock(symbol: string) {
    setWatchlist({
      status: 'loading',
      data: watchlist.data,
    })
    try {
      const res = await fetch(`/watchlist/default-user/${symbol}`, {
        method: 'PUT',
      })

      if (!res.ok) {
        throw new Error('Refresh stock error')
      }

      const updatedStockData: Stock = await res.json()
      setWatchlist({
        status: 'idle',
        data: {
          ...watchlist.data,
          [symbol]: updatedStockData,
        },
      })
    } catch (error) {
      setWatchlist({
        status: 'error',
        data: watchlist.data,
        message: error.message,
      })
    }
  }

  return (
    <div className="container">
      <h1 className="display-3">Stock Watchlist</h1>

      <div>
        <Search
          disabled={searchResults.status === 'loading'}
          value={searchTerm}
          onChange={(value) => {
            setSearchTerm(value)
          }}
          onSubmit={() => {
            search()
          }}
        />
        {searchResults.status === 'error' && (
          <p className="text-danger">
            An error occurred: {searchResults.message}
          </p>
        )}
      </div>

      {searchResults.data &&
        searchResults.data.map((stock) => (
          <SearchResult
            key={stock.symbol}
            stock={stock}
            disabled={
              searchResults.status === 'loading' ||
              Boolean(watchlist.data[stock.symbol])
            }
            onAdd={(stock) => {
              addStockToWatchlist(stock)
            }}
          />
        ))}

      <div>
        <WatchlistTable
          watchlist={watchlist.data}
          onRefresh={refreshStock}
          onRemove={removeStock}
        />
        {watchlist.status === 'error' && (
          <p className="text-danger">An error occurred: {watchlist.message}</p>
        )}
      </div>
    </div>
  )
}

export default App
