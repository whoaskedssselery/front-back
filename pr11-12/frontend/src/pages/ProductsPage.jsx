import React, { useState, useEffect } from 'react'
import { api } from '../api'
import ProductList from '../components/ProductList'
import ProductModal from '../components/ProductModal'
import UsersPage from './UsersPage'

export default function ProductsPage({ user, onLogout, onAuthClick }) {
	const [products, setProducts] = useState([])
	const [loading, setLoading] = useState(true)
	const [modalOpen, setModalOpen] = useState(false)
	const [modalMode, setModalMode] = useState('create')
	const [editingProduct, setEditingProduct] = useState(null)
	const [tab, setTab] = useState('products') // переключение между товарами и пользователями
	
	const role = user?.role
	
	// seller и admin могут создавать, редактировать и удалять товары
	const canEdit = role === 'seller' || role === 'admin'
	const canDelete = role === 'seller' || role === 'admin'
	
	const loadProducts = async () => {
		try {
			setLoading(true)
			setProducts(await api.getProducts())
		} catch (err) {
			console.error('Ошибка:', err)
		} finally {
			setLoading(false)
		}
	}
	
	useEffect(() => { loadProducts() }, [])
	
	const openCreate = () => { setModalMode('create'); setEditingProduct(null); setModalOpen(true) }
	const openEdit = (product) => { setModalMode('edit'); setEditingProduct(product); setModalOpen(true) }
	const closeModal = () => { setModalOpen(false); setEditingProduct(null) }
	
	const handleDelete = async (id) => {
		if (!window.confirm('Удалить товар?')) return
		try {
			await api.deleteProduct(id)
			setProducts(prev => prev.filter(p => p.id !== id))
		} catch (err) {
			alert('Ошибка удаления')
		}
	}
	
	const handleSubmitModal = async (payload) => {
		try {
			if (modalMode === 'create') {
				const newProduct = await api.createProduct(payload)
				setProducts(prev => [...prev, newProduct])
			} else {
				const updated = await api.updateProduct(payload.id, payload)
				setProducts(prev => prev.map(p => p.id === payload.id ? updated : p))
			}
			closeModal()
		} catch (err) {
			alert('Ошибка сохранения')
		}
	}
	
	return (
		<div className="page">
			<header>
				<h1>Магазин электроники</h1>
				<div className="header-right">
					{user ? (
						<>
							<span className="user-name">{user.first_name} {user.last_name} ({user.role})</span>
							{/* вкладка пользователей только для админа */}
							{role === 'admin' && (
								<>
									<button onClick={() => setTab('products')} className={tab === 'products' ? 'btn-primary' : ''}>Товары</button>
									<button onClick={() => setTab('users')} className={tab === 'users' ? 'btn-primary' : ''}>Пользователи</button>
								</>
							)}
							<button onClick={onLogout}>Выйти</button>
							{canEdit && tab === 'products' && (
								<button className="btn-primary" onClick={openCreate}>+ Добавить</button>
							)}
						</>
					) : (
						<>
							<span className="user-name">Гость</span>
							<button className="btn-primary" onClick={onAuthClick}>Войти</button>
						</>
					)}
				</div>
			</header>
			<main>
				{!user && (
					<div className="auth-banner">
						Войдите или зарегистрируйтесь чтобы управлять товарами
					</div>
				)}
				
				{tab === 'products' && (
					loading ? <div>Загрузка...</div> : (
						<ProductList
							products={products}
							onEdit={openEdit}
							onDelete={handleDelete}
							canEdit={canEdit}
							canDelete={canDelete}
						/>
					)
				)}
				
				{tab === 'users' && role === 'admin' && <UsersPage currentUserId={user.id} />}
			</main>
			
			<ProductModal
				open={modalOpen}
				mode={modalMode}
				initialProduct={editingProduct}
				onClose={closeModal}
				onSubmit={handleSubmitModal}
			/>
		</div>
	)
}