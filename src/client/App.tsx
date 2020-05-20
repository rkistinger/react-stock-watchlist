import React from 'react'
import { Typography } from 'antd'

import Search from './Search'

function App() {
  const [watchlist, setWatchlist] = React.useState()

  return (
    <div className="App">
      <Typography.Title>Stock Watchlist</Typography.Title>
      <Search
        onAdd={(stockData) => {
          setWatchlist([...watchlist, stockData])
        }}
      />
    </div>
  )
}

export default App
