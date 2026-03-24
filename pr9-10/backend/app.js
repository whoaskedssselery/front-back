const express = require('express')
const { nanoid } = require('nanoid')
const cors = require('cors')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const swaggerJsdoc = require('swagger-jsdoc')
const swaggerUi = require('swagger-ui-express')

const app = express()
const port = 3000

// Секреты и время жизни токенов
const JWT_SECRET = 'access_secret'
const REFRESH_SECRET = 'refresh_secret'
const ACCESS_EXPIRES_IN = '15m'
const REFRESH_EXPIRES_IN = '7d'

// Хранилище refresh-токенов в памяти
const refreshTokens = new Set()

app.use(express.json())
app.use(cors({
	origin: 'http://localhost:5173',
	methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
	allowedHeaders: ['Content-Type', 'Authorization']
}))

const swaggerOptions = {
	definition: {
		openapi: '3.0.0',
		info: {
			title: 'API интернет-магазина с авторизацией',
			version: '1.0.0',
			description: 'REST API с JWT аутентификацией, refresh-токенами и CRUD товаров',
		},
		servers: [{ url: `http://localhost:${port}`, description: 'Локальный сервер' }],
		components: {
			securitySchemes: {
				bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }
			}
		}
	},
	apis: ['./app.js'],
}

const swaggerSpec = swaggerJsdoc(swaggerOptions)
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))

// Логирование запросов
app.use((req, res, next) => {
	res.on('finish', () => {
		console.log(`[${req.method}] ${res.statusCode} ${req.path}`)
	})
	next()
})

let users = []
let products = [
	{ id: nanoid(6), title: 'Ноутбук ASUS ROG', category: 'Ноутбуки', description: 'Игровой ноутбук с RTX 4060', price: 85000, amount: 10 },
	{ id: nanoid(6), title: 'Ноутбук Lenovo IdeaPad', category: 'Ноутбуки', description: 'Офисный ноутбук для учёбы', price: 45000, amount: 15 },
	{ id: nanoid(6), title: 'Монитор LG 27"', category: 'Мониторы', description: 'IPS монитор 2K 144Hz', price: 32000, amount: 8 },
	{ id: nanoid(6), title: 'Монитор Samsung 24"', category: 'Мониторы', description: 'Full HD монитор для офиса', price: 18000, amount: 20 },
	{ id: nanoid(6), title: 'Мышь Logitech G502', category: 'Периферия', description: 'Игровая мышь с настраиваемым весом', price: 5500, amount: 30 },
	{ id: nanoid(6), title: 'Клавиатура HyperX Alloy', category: 'Периферия', description: 'Механическая клавиатура с RGB', price: 7000, amount: 25 },
	{ id: nanoid(6), title: 'Наушники Sony WH-1000XM5', category: 'Аудио', description: 'Беспроводные с шумоподавлением', price: 22000, amount: 12 },
	{ id: nanoid(6), title: 'Наушники HyperX Cloud III', category: 'Аудио', description: 'Игровая гарнитура', price: 9000, amount: 18 },
	{ id: nanoid(6), title: 'iPhone 15', category: 'Смартфоны', description: 'Флагман Apple 2023', price: 90000, amount: 5 },
	{ id: nanoid(6), title: 'Samsung Galaxy S24', category: 'Смартфоны', description: 'Флагман Samsung с AI', price: 75000, amount: 7 },
]

// Функции генерации токенов
function generateAccessToken(user) {
	return jwt.sign(
		{ sub: user.id, email: user.email },
		JWT_SECRET,
		{ expiresIn: ACCESS_EXPIRES_IN }
	)
}

function generateRefreshToken(user) {
	return jwt.sign(
		{ sub: user.id, email: user.email },
		REFRESH_SECRET,
		{ expiresIn: REFRESH_EXPIRES_IN }
	)
}

// JWT middleware для защищённых маршрутов
function authMiddleware(req, res, next) {
	const header = req.headers.authorization || ''
	const [scheme, token] = header.split(' ')
	if (scheme !== 'Bearer' || !token) {
		return res.status(401).json({ error: 'Missing or invalid Authorization header' })
	}
	try {
		const payload = jwt.verify(token, JWT_SECRET)
		req.user = payload
		next()
	} catch (err) {
		return res.status(401).json({ error: 'Invalid or expired token' })
	}
}

// ===== AUTH =====

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Регистрация пользователя
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, first_name, last_name, password]
 *             properties:
 *               email:
 *                 type: string
 *               first_name:
 *                 type: string
 *               last_name:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: Пользователь создан
 *       400:
 *         description: Некорректные данные
 */
app.post('/api/auth/register', async (req, res) => {
	const { email, first_name, last_name, password } = req.body
	if (!email || !first_name || !last_name || !password) {
		return res.status(400).json({ error: 'Все поля обязательны' })
	}
	const exists = users.find(u => u.email === email)
	if (exists) {
		return res.status(400).json({ error: 'Пользователь с таким email уже существует' })
	}
	const passwordHash = await bcrypt.hash(password, 10)
	const user = { id: nanoid(6), email, first_name, last_name, passwordHash }
	users.push(user)
	res.status(201).json({ id: user.id, email, first_name, last_name })
})

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Вход в систему
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Успешный вход, возвращает пару токенов
 *       401:
 *         description: Неверные данные
 */
app.post('/api/auth/login', async (req, res) => {
	const { email, password } = req.body
	if (!email || !password) {
		return res.status(400).json({ error: 'email и password обязательны' })
	}
	const user = users.find(u => u.email === email)
	if (!user) return res.status(401).json({ error: 'Invalid credentials' })
	const isValid = await bcrypt.compare(password, user.passwordHash)
	if (!isValid) return res.status(401).json({ error: 'Invalid credentials' })
	
	// Генерируем оба токена
	const accessToken = generateAccessToken(user)
	const refreshToken = generateRefreshToken(user)
	refreshTokens.add(refreshToken)
	
	res.json({ accessToken, refreshToken })
})

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Обновить пару токенов
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [refreshToken]
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Новая пара токенов
 *       400:
 *         description: refreshToken не передан
 *       401:
 *         description: Невалидный или истёкший refresh-токен
 */
app.post('/api/auth/refresh', (req, res) => {
	const { refreshToken } = req.body
	if (!refreshToken) {
		return res.status(400).json({ error: 'refreshToken обязателен' })
	}
	// Проверяем есть ли токен в хранилище
	if (!refreshTokens.has(refreshToken)) {
		return res.status(401).json({ error: 'Invalid refresh token' })
	}
	try {
		const payload = jwt.verify(refreshToken, REFRESH_SECRET)
		const user = users.find(u => u.id === payload.sub)
		if (!user) return res.status(401).json({ error: 'User not found' })
		
		// Ротация токенов — старый удаляем, новые создаём
		refreshTokens.delete(refreshToken)
		const newAccessToken = generateAccessToken(user)
		const newRefreshToken = generateRefreshToken(user)
		refreshTokens.add(newRefreshToken)
		
		res.json({ accessToken: newAccessToken, refreshToken: newRefreshToken })
	} catch (err) {
		return res.status(401).json({ error: 'Invalid or expired refresh token' })
	}
})

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Получить текущего пользователя
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Данные текущего пользователя
 *       401:
 *         description: Не авторизован
 */
app.get('/api/auth/me', authMiddleware, (req, res) => {
	const user = users.find(u => u.id === req.user.sub)
	if (!user) return res.status(404).json({ error: 'User not found' })
	res.json({ id: user.id, email: user.email, first_name: user.first_name, last_name: user.last_name })
})

// ===== PRODUCTS =====

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Получить список всех товаров
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: Список товаров
 */
app.get('/api/products', (req, res) => {
	res.json(products)
})

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Создать товар
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, category, description, price, amount]
 *             properties:
 *               title:
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
 *         description: Товар создан
 *       401:
 *         description: Не авторизован
 */
app.post('/api/products', authMiddleware, (req, res) => {
	const { title, category, description, price, amount, image } = req.body
	const newProduct = { id: nanoid(6), title, category, description, price, amount, image }
	products.push(newProduct)
	res.status(201).json(newProduct)
})

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Получить товар по ID
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Данные товара
 *       401:
 *         description: Не авторизован
 *       404:
 *         description: Товар не найден
 */
app.get('/api/products/:id', authMiddleware, (req, res) => {
	const product = products.find(p => p.id === req.params.id)
	if (!product) return res.status(404).json({ error: 'Товар не найден' })
	res.json(product)
})

/**
 * @swagger
 * /api/products/{id}:
 *   put:
 *     summary: Обновить товар
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
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
 *       401:
 *         description: Не авторизован
 *       404:
 *         description: Товар не найден
 */
app.put('/api/products/:id', authMiddleware, (req, res) => {
	const product = products.find(p => p.id === req.params.id)
	if (!product) return res.status(404).json({ error: 'Товар не найден' })
	const { title, category, description, price, amount, image } = req.body
	if (title !== undefined) product.title = title
	if (category !== undefined) product.category = category
	if (description !== undefined) product.description = description
	if (price !== undefined) product.price = price
	if (amount !== undefined) product.amount = amount
	if (image !== undefined) product.image = image
	res.json(product)
})

/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     summary: Удалить товар
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Товар удалён
 *       401:
 *         description: Не авторизован
 *       404:
 *         description: Товар не найден
 */
app.delete('/api/products/:id', authMiddleware, (req, res) => {
	const exists = products.some(p => p.id === req.params.id)
	if (!exists) return res.status(404).json({ error: 'Товар не найден' })
	products = products.filter(p => p.id !== req.params.id)
	res.status(204).send()
})

app.listen(port, () => {
	console.log(`Сервер запущен на http://localhost:${port}`)
	console.log(`Swagger UI: http://localhost:${port}/api-docs`)
})