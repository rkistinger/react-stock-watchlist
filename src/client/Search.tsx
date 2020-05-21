import React from 'react'
import { Form, InputGroup, InputGroupAddon, Button, Input } from 'reactstrap'

interface Props {
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
  disabled: boolean
}

export default function Search(props: Props) {
  return (
    <Form
      className="mb-3"
      onSubmit={(event) => {
        event.preventDefault()
        props.onSubmit()
      }}
    >
      <InputGroup>
        <Input
          disabled={props.disabled}
          placeholder="enter a stock symbol"
          value={props.value}
          onChange={(event) => {
            props.onChange(event.target.value)
          }}
        />
        <InputGroupAddon addonType="append">
          <Button color="primary" type="submit">
            Search
          </Button>
        </InputGroupAddon>
      </InputGroup>
    </Form>
  )
}
