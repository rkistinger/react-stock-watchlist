import React from 'react'

export interface Stock {
  '52_week_high': string | null
  '52_week_low': string | null
  change_pct: string | null
  close_yesterday: string | null
  currency: string | null
  day_change: string | null
  day_high: string | null
  day_low: string | null
  eps: string | null
  gmt_offset: string | null
  last_trade_time: string | null
  market_cap: string | null
  name: string | null
  pe: string | null
  price: string | null
  price_open: string | null
  shares: string | null
  stock_exchange_long: string | null
  stock_exchange_short: string | null
  symbol: string | null
  timezone: string | null
  timezone_name: string | null
  volume: string | null
  volume_avg: string | null
}

interface Props {
  stock: Stock
}

export default function (props: Props) {
  return <div>hi</div>
}
