import React from 'react'

import { Stock } from '../types'
import StockDetails from './StockDetails'
import { Button, Card, CardBody, CardTitle } from 'reactstrap'

interface Props {
  stock: Stock
  onAdd: (stock: Stock) => void
  disabled: boolean
}

export default function SearchResult(props: Props) {
  return (
    <Card className="mb-3">
      <CardBody>
        <CardTitle tag="h4">{props.stock.symbol}</CardTitle>
        <div className="mb-3">
          <StockDetails stock={props.stock} cols={3} />
        </div>
        <Button
          disabled={props.disabled}
          color="primary"
          onClick={() => {
            props.onAdd(props.stock)
          }}
        >
          Add to watchlist
        </Button>
      </CardBody>
    </Card>
  )
}
