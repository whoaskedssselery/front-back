const express = require('express')
const { nanoid } = require('nanoid')
const app = express()
const cors = require('cors')
const swaggerJsdoc = require('swagger-jsdoc')
const swaggerUi = require('swagger-ui-express')
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

// Настройка сваггера
const swaggerOptions = {
	definition: {
		openapi: '3.0.0',
		info: {
			title: 'API интернет-магазина электроники',
			version: '1.0.0',
			description: 'CRUD API для управления товарами интернет-магазина',
		},
		servers: [{ url: `http://localhost:${port}`, description: 'Локальный сервер' }],
	},
	apis: ['./app.js'],
}

const swaggerSpec = swaggerJsdoc(swaggerOptions)
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))

// Middleware для логирования запросов
app.use(
	(req, res, next) => {
		res.on('finish', () => {
			console.log(`[${req.method}] ${res.statusCode} ${req.path}`)
		})
		next()
	})

/**
 * @swagger
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       required:
 *         - name
 *         - category
 *         - description
 *         - price
 *         - amount
 *       properties:
 *         id:
 *           type: string
 *           description: Автоматически сгенерированный ID
 *         name:
 *           type: string
 *           description: Название товара
 *         category:
 *           type: string
 *           description: Категория товара
 *         description:
 *           type: string
 *           description: Описание товара
 *         price:
 *           type: number
 *           description: Цена товара
 *         amount:
 *           type: integer
 *           description: Количество на складе
 *       example:
 *         id: "abc123"
 *         name: "Ноутбук ASUS ROG"
 *         category: "Ноутбуки"
 *         description: "Игровой ноутбук с RTX 4060"
 *         price: 85000
 *         amount: 10
 */

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Получить список всех товаров
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: Список товаров
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 */
// Получение всех товаров
app.get('/api/products', (req, res) => {
	res.json(products)
})

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Получить товар по ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID товара
 *     responses:
 *       200:
 *         description: Данные товара
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: Товар не найден
 */
// Получение товара по айди
app.get('/api/products/:id', (req, res) => {
	const product = products.find(p => p.id === req.params.id)
	if (!product) return res.status(404).json({ error: 'Товар не найден!' })
	res.json(product)
})

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Создать новый товар
 *     tags: [Products]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - category
 *               - description
 *               - price
 *               - amount
 *             properties:
 *               name:
 *                 type: string
 *               category:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               amount:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Товар успешно создан
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 */
// Добавление товара
app.post('/api/products', (req, res) => {
	const { name, category, description, price, amount } = req.body
	const newProduct = { id: nanoid(6), name, category, description, price, amount }
	products.push(newProduct)
	res.status(201).json(newProduct)
})

/**
 * @swagger
 * /api/products/{id}:
 *   patch:
 *     summary: Обновить товар
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID товара
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               category:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               amount:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Товар обновлён
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: Товар не найден
 */
// Обновление товара
app.patch('/api/products/:id', (req, res) => {
	const product = products.find(p => p.id === req.params.id)
	if (!product) return res.status(404).json({ error: 'Товар не найден' })
	const { name, category, description, price, amount } = req.body
	if (name !== undefined) product.name = name
	if (category !== undefined) product.category = category
	if (description !== undefined) product.description = description
	if (price !== undefined) product.price = price
	if (amount !== undefined) product.amount = amount
	res.json(product)
})

/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     summary: Удалить товар
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID товара
 *     responses:
 *       204:
 *         description: Товар удалён
 *       404:
 *         description: Товар не найден
 */
// Удаление товара
app.delete('/api/products/:id', (req, res) => {
	const exists = products.some(p => p.id === req.params.id)
	if (!exists) return res.status(404).json({ error: 'Товар не найден' })
	products = products.filter(p => p.id !== req.params.id)
	res.status(204).send()
})

// Запуск сервера
app.listen(port, () => {
	console.log(`Сервер запущен на http://localhost:${port}`)
	console.log(`Swagger UI доступен по адресу http://localhost:${port}/api-docs`)
})