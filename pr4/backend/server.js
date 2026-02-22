const express = require('express')
const { nanoid } = require('nanoid')
const app = express()
const cors = require('cors')
const port = 3000

app.use(cors({
  origin: 'http://localhost:5174',
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type']
}))

let products = [
  { id: nanoid(6), name: 'Ноутбук ASUS ROG', category: 'Ноутбуки', description: 'Игровой ноутбук с RTX 4060 и 16GB RAM', price: 85000, amount: 10 },
  { id: nanoid(6), name: 'Ноутбук Lenovo IdeaPad', category: 'Ноутбуки', description: 'Офисный ноутбук для учёбы и работы', price: 45000, amount: 15 },
  { id: nanoid(6), name: 'Монитор LG 27"', category: 'Мониторы', description: 'IPS монитор 2K 144Hz для работы и игр', price: 32000, amount: 8 },
  { id: nanoid(6), name: 'Монитор Samsung 24"', category: 'Мониторы', description: 'Full HD монитор для офиса', price: 18000, amount: 20 },
  { id: nanoid(6), name: 'Мышь Logitech G502', category: 'Периферия', description: 'Игровая мышь с настраиваемым весом', price: 5500, amount: 30 },
  { id: nanoid(6), name: 'Клавиатура HyperX Alloy', category: 'Периферия', description: 'Механическая клавиатура с RGB подсветкой', price: 7000, amount: 25 },
  { id: nanoid(6), name: 'Наушники Sony WH-1000XM5', category: 'Аудио', description: 'Беспроводные наушники с шумоподавлением', price: 22000, amount: 12 },
  { id: nanoid(6), name: 'Наушники HyperX Cloud III', category: 'Аудио', description: 'Игровая гарнитура с объёмным звуком', price: 9000, amount: 18 },
  { id: nanoid(6), name: 'iPhone 15', category: 'Смартфоны', description: 'Флагманский смартфон Apple 2023 года', price: 90000, amount: 5 },
  { id: nanoid(6), name: 'Samsung Galaxy S24', category: 'Смартфоны', description: 'Флагман Samsung с AI функциями', price: 75000, amount: 7 },
]

app.use(express.json())

// Middleware для логирования запросов
app.use(
   (req, res, next) => {
      res.on('finish', () => {
         console.log(`[${req.method}] ${res.statusCode} ${req.path}`)
      })
      next()   
})

// Получение всех товаров
app.get(
   '/api/products', (req, res) => {
      res.json(products)
})

// Получение товара по айди
app.get(
   '/api/products/:id', (req, res) => {
      const product = products.find(p => p.id === req.params.id)
      if (!product) return res.status(404).json({ error: 'Товар не найден!' })
      res.json(product)
})

// Добавление товара
app.post(
   '/api/products', (req, res) => {
      const { name, category, description, price, amount } = req.body
      const newProduct = { id: nanoid(6), name, category, description, price, amount }
      products.push(newProduct)
      res.status(201).json(newProduct)
})

// Обновление товара
app.patch(
   '/api/products/:id', (req, res) => {
      const product = products.find(p => p.id === req.params.id)
      if (!product) return res.status(404).json({ error: 'Товар не найден' })
      const { name, category, description, price, amount } = req.body
      if (name !== undefined) product.name = name
      if (category !== undefined) product.category = category
      if (description !== undefined) product.description = description
      if (price !== undefined) product.price = price
      if (amount !== undefined) product.amount = amount
      res.json(product)
   }
)

// Удаление товара
app.delete(
   '/api/products/:id', (req, res) => {
      const exists = products.some(p => p.id === req.params.id)
      if (!exists) return res.status(404).json({ error: 'Товар не найден' })
      products = products.filter(p => p.id !== req.params.id)
      res.status(204).send()
})

// Запуск сервера
app.listen(port, () => {
  console.log(`Сервер запущен на http://localhost:${port}`)
})
