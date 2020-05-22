import React from 'react'
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Table,
} from 'reactstrap'

import { Watchlist, Stock } from '../types'
import StockDetails from './StockDetails'

interface Props {
  watchlist: Watchlist
  onRefresh: (symbol: string) => void
  onRemove: (symbol: string) => void
}

export default function WatchlistTable(props: Props) {
  const [selectedStock, setSelectedStock] = React.useState<Stock>()

  function closeModal() {
    setSelectedStock(undefined)
  }

  return (
    <React.Fragment>
      <Table hover>
        <thead>
          <tr>
            <th>Symbol</th>
            <th>Open</th>
            <th>Close</th>
            <th>Day High</th>
            <th>Day Low</th>
            <th>Volume</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {Object.values(props.watchlist).map((stock) => (
            <tr
              key={stock.symbol}
              data-testid={`watchlist-row-${stock.symbol}`}
              onClick={() => {
                setSelectedStock(stock)
              }}
            >
              <td>{stock.symbol}</td>
              <td>{stock.price_open || 'N/A'}</td>
              <td>{stock.close_yesterday || 'N/A'}</td>
              <td>{stock.day_high || 'N/A'}</td>
              <td>{stock.day_low || 'N/A'}</td>
              <td>{stock.volume || 'N/A'}</td>
              <td>
                <Button
                  outline
                  size="sm"
                  className="mr-1"
                  onClick={(event) => {
                    event.stopPropagation()
                    props.onRefresh(stock.symbol)
                  }}
                >
                  Refresh
                </Button>
                <Button
                  outline
                  color="danger"
                  size="sm"
                  onClick={(event) => {
                    event.stopPropagation()
                    props.onRemove(stock.symbol)
                  }}
                >
                  Remove
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Modal size="lg" isOpen={Boolean(selectedStock)} toggle={closeModal}>
        <ModalHeader toggle={closeModal}>
          Stock Details: {selectedStock?.symbol}
        </ModalHeader>
        <ModalBody>
          {selectedStock && <StockDetails stock={selectedStock} cols={2} />}
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={closeModal}>
            Dismiss
          </Button>
        </ModalFooter>
      </Modal>
    </React.Fragment>
  )
}
