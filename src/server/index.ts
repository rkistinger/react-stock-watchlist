import createServer from './server'

const PORT = 3001
const db = {}

const server = createServer(db)

server.listen(PORT, () => {
  console.log(`Server is running on: ${PORT}💡`)
})
