class ProductManager {
	constructor(apiUrl) {
		this.API = apiUrl;
		this.productsContainer = document.getElementById('products');
		this.addForm = document.getElementById('addForm');
		this.nameInput = document.getElementById('name');
		this.priceInput = document.getElementById('price');
		
		this.init();
	}
	
	init() {
		this.addForm.onsubmit = (e) => this.handleAddProduct(e);
		this.loadProducts();
	}
	
	loadProducts() {
		fetch(this.API)
			.then(res => res.json())
			.then(data => {
				this.renderProducts(data);
			})
			.catch(err => {
				console.error('Ошибка загрузки:', err);
				this.productsContainer.innerHTML = '<p>Ошибка загрузки товаров</p>';
			});
	}
	
	renderProducts(products) {
		let html = '';
		
		if (products.length === 0) {
			html = '<p>Товаров пока нет</p>';
		} else {
			products.forEach(p => {
				html += `
				<div class="product">
					<span class="product-id">#${p.id}</span>
					<div class="product-info">
						<h3>${p.name}</h3>
						<p>${p.price} ₽</p>
					</div>
					<div class="product-actions">
						<button class="edit-btn" data-id="${p.id}">Изменить</button>
						<button class="delete-btn" data-id="${p.id}">Удалить</button>
					</div>
				</div>
			`;
			});
		}
		
		this.productsContainer.innerHTML = html;
		this.attachEventListeners();
	}
	
	attachEventListeners() {
		const editButtons = document.querySelectorAll('.edit-btn');
		const deleteButtons = document.querySelectorAll('.delete-btn');
		
		editButtons.forEach(btn => {
			btn.onclick = () => this.editProduct(btn.dataset.id);
		});
		
		deleteButtons.forEach(btn => {
			btn.onclick = () => this.deleteProduct(btn.dataset.id);
		});
	}
	
	handleAddProduct(e) {
		e.preventDefault();
		
		const name = this.nameInput.value;
		const price = this.priceInput.value;
		
		fetch(this.API, {
			method: 'POST',
			headers: {'Content-Type': 'application/json'},
			body: JSON.stringify({name: name, price: Number(price)})
		})
			.then(res => res.json())
			.then(() => {
				this.addForm.reset();
				this.loadProducts();
			})
			.catch(err => {
				console.error('Ошибка добавления:', err);
				alert('Не удалось добавить товар');
			});
	}
	
	deleteProduct(id) {
		fetch(this.API + '/' + id, {
			method: 'DELETE'
		})
			.then(() => {
				this.loadProducts();
			})
			.catch(err => {
				console.error('Ошибка удаления:', err);
				alert('Не удалось удалить товар');
			});
	}
	
	editProduct(id) {
		const name = prompt('Новое название:');
		if(!name) return;
		
		const price = prompt('Новая цена:');
		if(!price) return;
		
		fetch(this.API + '/' + id, {
			method: 'PATCH',
			headers: {'Content-Type': 'application/json'},
			body: JSON.stringify({name: name, price: Number(price)})
		})
			.then(() => {
				this.loadProducts();
			})
			.catch(err => {
				console.error('Ошибка изменения:', err);
				alert('Не удалось изменить товар');
			});
	}
}

const productManager = new ProductManager('http://localhost:3000/products');