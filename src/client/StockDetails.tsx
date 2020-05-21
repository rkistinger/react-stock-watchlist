import React from 'react'

import { Stock } from '../types'

interface Props {
  stock: Stock
  cols: number
}

export default function (props: Props) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${props.cols}, auto)`,
      }}
    >
      <div>
        <span className="font-weight-bold">52 week low:</span>{' '}
        {props.stock['52_week_low']}
      </div>
      <div>
        <span className="font-weight-bold">52 week high:</span>{' '}
        {props.stock['52_week_high']}
      </div>
      <div>
        <span className="font-weight-bold">change_pct:</span>{' '}
        {props.stock.change_pct}
      </div>
      <div>
        <span className="font-weight-bold">close_yesterday:</span>{' '}
        {props.stock.close_yesterday}
      </div>
      <div>
        <span className="font-weight-bold">currency:</span>{' '}
        {props.stock.currency}
      </div>
      <div>
        <span className="font-weight-bold">day_change:</span>{' '}
        {props.stock.day_change}
      </div>
      <div>
        <span className="font-weight-bold">day_high:</span>{' '}
        {props.stock.day_high}
      </div>
      <div>
        <span className="font-weight-bold">day_low:</span> {props.stock.day_low}
      </div>
      <div>
        <span className="font-weight-bold">eps:</span> {props.stock.eps}
      </div>
      <div>
        <span className="font-weight-bold">gmt_offset:</span>{' '}
        {props.stock.gmt_offset}
      </div>
      <div>
        <span className="font-weight-bold">last_trade_time:</span>{' '}
        {props.stock.last_trade_time}
      </div>
      <div>
        <span className="font-weight-bold">market_cap:</span>{' '}
        {props.stock.market_cap}
      </div>
      <div>
        <span className="font-weight-bold">name:</span> {props.stock.name}
      </div>
      <div>
        <span className="font-weight-bold">pe:</span> {props.stock.pe}
      </div>
      <div>
        <span className="font-weight-bold">price:</span> {props.stock.price}
      </div>
      <div>
        <span className="font-weight-bold">price_open:</span>{' '}
        {props.stock.price_open}
      </div>
      <div>
        <span className="font-weight-bold">shares:</span> {props.stock.shares}
      </div>
      <div>
        <span className="font-weight-bold">stock_exchange_long:</span>{' '}
        {props.stock.stock_exchange_long}
      </div>
      <div>
        <span className="font-weight-bold">stock_exchange_short:</span>{' '}
        {props.stock.stock_exchange_short}
      </div>
      <div>
        <span className="font-weight-bold">symbol:</span> {props.stock.symbol}
      </div>
      <div>
        <span className="font-weight-bold">timezone:</span>{' '}
        {props.stock.timezone}
      </div>
      <div>
        <span className="font-weight-bold">timezone_name:</span>{' '}
        {props.stock.timezone_name}
      </div>
      <div>
        <span className="font-weight-bold">volume:</span> {props.stock.volume}
      </div>
      <div>
        <span className="font-weight-bold">volume_avg:</span>{' '}
        {props.stock.volume_avg}
      </div>
    </div>
  )
}
