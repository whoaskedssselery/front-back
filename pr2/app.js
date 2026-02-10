const express = require('express');
const app = express();
const port = 3000;

let products = [
	{ id: 1, name: 'Ноутбук', price: 50000 },
	{ id: 2, name: 'Мышь', price: 1500 },
	{ id: 3, name: 'Клавиатура', price: 3000 }
];

function reindexProducts() {
	products = products.map((product, index) => ({
		...product,
		id: index + 1
	}));
}

function getNextId() {
	if (products.length === 0) return 1;
	return Math.max(...products.map(p => p.id)) + 1;
}

app.use(express.json());
app.use(express.static('public'));

app.post('/products', (req, res) => {
	const { name, price } = req.body;
	const newProduct = {
		id: getNextId(),
		name,
		price
	};
	products.push(newProduct);
	res.status(201).json(newProduct);
});

app.get('/products', (req, res) => {
	res.json(products);
});

app.get('/products/:id', (req, res) => {
	const product = products.find(p => p.id == req.params.id);
	if (!product) {
		return res.status(404).json({ message: 'Товар не найден' });
	}
	res.json(product);
});

app.patch('/products/:id', (req, res) => {
	const product = products.find(p => p.id == req.params.id);
	if (!product) {
		return res.status(404).json({ message: 'Товар не найден' });
	}
	const { name, price } = req.body;
	if (name !== undefined) product.name = name;
	if (price !== undefined) product.price = price;
	res.json(product);
});

app.delete('/products/:id', (req, res) => {
	const initialLength = products.length;
	products = products.filter(p => p.id != req.params.id);
	
	if (products.length === initialLength) {
		return res.status(404).json({ message: 'Товар не найден' });
	}

	reindexProducts();
	
	res.json({ message: 'Товар успешно удален', products: products });
});

app.listen(port, () => {
	console.log(`Сервер запущен на http://localhost:${port}`);
});