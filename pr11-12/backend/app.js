const express = require('express')
const { nanoid } = require('nanoid')
const cors = require('cors')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const swaggerJsdoc = require('swagger-jsdoc')
const swaggerUi = require('swagger-ui-express')

const app = express()
const port = 3000

const JWT_SECRET = 'access_secret'
const REFRESH_SECRET = 'refresh_secret'
const ACCESS_EXPIRES_IN = '7d'
const REFRESH_EXPIRES_IN = '15d'

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
			description: 'REST API с JWT, refresh-токенами, RBAC и CRUD товаров',
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

// роль добавлена в токен — чтобы сервер знал права пользователя без запроса в БД
function generateAccessToken(user) {
	return jwt.sign(
		{ sub: user.id, email: user.email, role: user.role },
		JWT_SECRET,
		{ expiresIn: ACCESS_EXPIRES_IN }
	)
}

function generateRefreshToken(user) {
	return jwt.sign(
		{ sub: user.id, email: user.email, role: user.role },
		REFRESH_SECRET,
		{ expiresIn: REFRESH_EXPIRES_IN }
	)
}

// проверяет что пользователь залогинен
function authMiddleware(req, res, next) {
	const header = req.headers.authorization || ''
	const [scheme, token] = header.split(' ')
	if (scheme !== 'Bearer' || !token) {
		return res.status(401).json({ error: 'Missing or invalid Authorization header' })
	}
	try {
		const payload = jwt.verify(token, JWT_SECRET)
		const user = users.find(u => u.id === payload.sub)
		if (!user) return res.status(401).json({ error: 'User not found' })
		req.user = { ...payload, role: user.role }
		next()
	} catch (err) {
		return res.status(401).json({ error: 'Invalid or expired token' })
	}
}

// проверяет что роль пользователя входит в список разрешённых для маршрута
function roleMiddleware(allowedRoles) {
	return (req, res, next) => {
		if (!req.user || !allowedRoles.includes(req.user.role)) {
			return res.status(403).json({ error: 'Forbidden' })
		}
		next()
	}
}

// ===== AUTH =====

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
	const user = {
		id: nanoid(6),
		email,
		first_name,
		last_name,
		passwordHash,
		role: 'user' // все новые пользователи получают роль user
	}
	users.push(user)
	res.status(201).json({ id: user.id, email, first_name, last_name, role: user.role })
})

app.post('/api/auth/login', async (req, res) => {
	const { email, password } = req.body
	if (!email || !password) {
		return res.status(400).json({ error: 'email и password обязательны' })
	}
	const user = users.find(u => u.email === email)
	if (!user) return res.status(401).json({ error: 'Invalid credentials' })
	const isValid = await bcrypt.compare(password, user.passwordHash)
	if (!isValid) return res.status(401).json({ error: 'Invalid credentials' })
	
	const accessToken = generateAccessToken(user)
	const refreshToken = generateRefreshToken(user)
	refreshTokens.add(refreshToken)
	
	res.json({ accessToken, refreshToken })
})

app.post('/api/auth/refresh', (req, res) => {
	const { refreshToken } = req.body
	if (!refreshToken) {
		return res.status(400).json({ error: 'refreshToken обязателен' })
	}
	if (!refreshTokens.has(refreshToken)) {
		return res.status(401).json({ error: 'Invalid refresh token' })
	}
	try {
		const payload = jwt.verify(refreshToken, REFRESH_SECRET)
		const user = users.find(u => u.id === payload.sub)
		if (!user) return res.status(401).json({ error: 'User not found' })
		
		refreshTokens.delete(refreshToken)
		const newAccessToken = generateAccessToken(user)
		const newRefreshToken = generateRefreshToken(user)
		refreshTokens.add(newRefreshToken)
		
		res.json({ accessToken: newAccessToken, refreshToken: newRefreshToken })
	} catch (err) {
		return res.status(401).json({ error: 'Invalid or expired refresh token' })
	}
})

app.get('/api/auth/me', authMiddleware, (req, res) => {
	const user = users.find(u => u.id === req.user.sub)
	if (!user) return res.status(404).json({ error: 'User not found' })
	res.json({ id: user.id, email: user.email, first_name: user.first_name, last_name: user.last_name, role: user.role })
})

// ===== USERS (только админ) =====

app.get('/api/users', authMiddleware, roleMiddleware(['admin']), (req, res) => {
	res.json(users.map(u => ({
		id: u.id,
		email: u.email,
		first_name: u.first_name,
		last_name: u.last_name,
		role: u.role,
		blocked: u.blocked || false
	})))
})

app.get('/api/users/:id', authMiddleware, roleMiddleware(['admin']), (req, res) => {
	const user = users.find(u => u.id === req.params.id)
	if (!user) return res.status(404).json({ error: 'Пользователь не найден' })
	res.json({ id: user.id, email: user.email, first_name: user.first_name, last_name: user.last_name, role: user.role, blocked: user.blocked || false })
})

app.put('/api/users/:id', authMiddleware, roleMiddleware(['admin']), (req, res) => {
	const user = users.find(u => u.id === req.params.id)
	if (!user) return res.status(404).json({ error: 'Пользователь не найден' })
	
	if (req.params.id === req.user.sub && req.body.role !== undefined) {
		return res.status(403).json({ error: 'Нельзя менять свою роль' })
	}
	
	const { first_name, last_name, role } = req.body
	if (first_name !== undefined) user.first_name = first_name
	if (last_name !== undefined) user.last_name = last_name
	if (role !== undefined) user.role = role
	res.json({ id: user.id, email: user.email, first_name: user.first_name, last_name: user.last_name, role: user.role })
})

// DELETE пользователя = блокировка, физически не удаляем
app.delete('/api/users/:id', authMiddleware, roleMiddleware(['admin']), (req, res) => {
	const user = users.find(u => u.id === req.params.id)
	if (!user) return res.status(404).json({ error: 'Пользователь не найден' })
	user.blocked = true
	res.json({ message: 'Пользователь заблокирован', id: user.id })
})

// ===== PRODUCTS =====

// без авторизации — список товаров видят все
app.get('/api/products', (req, res) => {
	res.json(products)
})

// залогиненный пользователь может смотреть товар по id
app.get('/api/products/:id', authMiddleware, (req, res) => {
	const product = products.find(p => p.id === req.params.id)
	if (!product) return res.status(404).json({ error: 'Товар не найден' })
	res.json(product)
})

// создавать и редактировать товары могут продавец и админ
app.post('/api/products', authMiddleware, roleMiddleware(['seller', 'admin']), (req, res) => {
	const { title, category, description, price, amount } = req.body
	const newProduct = { id: nanoid(6), title, category, description, price, amount }
	products.push(newProduct)
	res.status(201).json(newProduct)
})

app.put('/api/products/:id', authMiddleware, roleMiddleware(['seller', 'admin']), (req, res) => {
	const product = products.find(p => p.id === req.params.id)
	if (!product) return res.status(404).json({ error: 'Товар не найден' })
	const { title, category, description, price, amount } = req.body
	if (title !== undefined) product.title = title
	if (category !== undefined) product.category = category
	if (description !== undefined) product.description = description
	if (price !== undefined) product.price = price
	if (amount !== undefined) product.amount = amount
	res.json(product)
})

// удалять товары может только админ
app.delete('/api/products/:id', authMiddleware, roleMiddleware(['admin']), (req, res) => {
	const exists = products.some(p => p.id === req.params.id)
	if (!exists) return res.status(404).json({ error: 'Товар не найден' })
	products = products.filter(p => p.id !== req.params.id)
	res.status(204).send()
})

// создаём админа при старте сервера
app.listen(port, async () => {
	const passwordHash = await bcrypt.hash('admin', 10)
	users.push({
		id: nanoid(6),
		email: 'admin@admin.com',
		first_name: 'Admin',
		last_name: 'Admin',
		passwordHash,
		role: 'admin'
	})
	console.log(`Сервер запущен на http://localhost:${port}`)
	console.log(`Swagger UI: http://localhost:${port}/api-docs`)
	console.log(`Админ: admin@admin.com / admin`)
})