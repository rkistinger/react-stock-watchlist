import React from 'react'
import { Typography, Input, Card } from 'antd'

import StockDetails, { Stock } from './StockDetails'

interface Props {
  onAdd: (stockData: unknown) => void
}

export default function Search(props: Props) {
  const [status, setStatus] = React.useState<'loading' | 'error' | 'idle'>(
    'idle'
  )
  const [searchTerm, setSearchTerm] = React.useState('')
  const [searchResult, setSearchResult] = React.useState<string | Stock>()

  async function doSearch(value: string) {
    const res = await fetch(`/stock?symbol=${value}`)
    const json = await res.json()

    if (!res.ok) {
      setSearchResult(json)
      setStatus('error')
      return
    }

    setSearchResult(json.data[0])
    setStatus('idle')
  }

  return (
    <div>
      <Input.Search
        disabled={status === 'loading'}
        placeholder="enter a stock symbol"
        enterButton="Search"
        size="large"
        value={searchTerm}
        onChange={(event) => {
          setSearchTerm(event.target.value)
        }}
        onSearch={doSearch}
      />

      {status === 'error' && (
        <Typography.Paragraph>
          An error occurred: {searchResult}
        </Typography.Paragraph>
      )}

      {status === 'idle' && searchResult && (
        <Card title={(searchResult as Stock).symbol}>
          <StockDetails stock={searchResult as Stock} />
        </Card>
      )}
    </div>
  )
}
