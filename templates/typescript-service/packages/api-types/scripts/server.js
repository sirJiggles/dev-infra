const express = require('express')
const path = require('path')
const app = express()
const port = 3010

app.get('/', (_, res) => {
  res.sendFile(path.join(__dirname, '../src/index.html'))
})

app.get('/schema', (_, res) => {
  res.sendFile(path.join(__dirname, '../src/schema.yml'))
})

app.listen(port, () => {
  console.log(`http://localhost:${port}`)
})
