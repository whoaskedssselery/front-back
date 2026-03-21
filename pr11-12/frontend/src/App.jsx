import React, { useState, useEffect } from 'react'
import './App.css'
import { api } from './api'
import ProductsPage from './pages/ProductsPage'
import AuthModal from './pages/AuthModal'

export default function App() {
	const [user, setUser] = useState(null)
	const [authChecked, setAuthChecked] = useState(false)
	const [authModalOpen, setAuthModalOpen] = useState(false)
	const [banned, setBanned] = useState(false)
	
	useEffect(() => {
		const token = localStorage.getItem('accessToken')
		if (token) {
			api.getMe()
				.then(data => setUser(data))
				.catch(() => {
					localStorage.removeItem('accessToken')
					localStorage.removeItem('refreshToken')
				})
				.finally(() => setAuthChecked(true))
		} else {
			setAuthChecked(true)
		}
	}, [])
	
	// выброс по истечению refresh-токена
	useEffect(() => {
		const handler = () => setUser(null)
		window.addEventListener('auth:logout', handler)
		return () => window.removeEventListener('auth:logout', handler)
	}, [])
	
	// показываем экран бана когда пользователя заблокировали
	useEffect(() => {
		const handler = () => {
			setBanned(true)
			setUser(null)
		}
		window.addEventListener('auth:banned', handler)
		return () => window.removeEventListener('auth:banned', handler)
	}, [])
	
	// смена роли и проверка бана в реальном времени
	useEffect(() => {
		if (!user) return
		const interval = setInterval(async () => {
			try {
				const me = await api.getMe()
				setUser(me)
			} catch {}
		}, 5000)
		return () => clearInterval(interval)
	}, [user])
	
	const handleLogin = async (formData) => {
		const data = await api.login(formData)
		localStorage.setItem('accessToken', data.accessToken)
		localStorage.setItem('refreshToken', data.refreshToken)
		const me = await api.getMe()
		setBanned(false)
		setUser(me)
	}
	
	const handleRegister = async (formData) => {
		await api.register(formData)
		await handleLogin({ email: formData.email, password: formData.password })
	}
	
	const handleLogout = () => {
		localStorage.removeItem('accessToken')
		localStorage.removeItem('refreshToken')
		setUser(null)
	}
	
	if (!authChecked) return <div className="loading">Загрузка...</div>
	
	// экран бана — показывается вместо всего сайта
	if (banned) return (
		<div className="loading" style={{ flexDirection: 'column', gap: 16 }}>
			<span style={{ fontSize: 64 }}>🚫</span>
			<span style={{ fontSize: 20, fontWeight: 700 }}>Ваш аккаунт заблокирован</span>
			<span style={{ opacity: 0.5, fontSize: 14 }}>Обратитесь к администратору</span>
		</div>
	)
	
	return (
		<div className="App">
			<ProductsPage
				user={user}
				onLogout={handleLogout}
				onAuthClick={() => setAuthModalOpen(true)}
			/>
			{authModalOpen && (
				<AuthModal
					onClose={() => setAuthModalOpen(false)}
					onLogin={handleLogin}
					onRegister={handleRegister}
				/>
			)}
		</div>
	)
}