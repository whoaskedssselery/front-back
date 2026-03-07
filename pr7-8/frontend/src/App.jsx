import React, { useState, useEffect } from 'react'
import './App.css'
import { api } from './api'
import ProductsPage from './pages/ProductsPage'
import AuthModal from './pages/AuthModal'

export default function App() {
	const [user, setUser] = useState(null)
	const [authChecked, setAuthChecked] = useState(false)
	const [authModalOpen, setAuthModalOpen] = useState(false)
	
	useEffect(() => {
		const token = localStorage.getItem('token')
		if (token) {
			api.getMe()
				.then(data => setUser(data))
				.catch(() => localStorage.removeItem('token'))
				.finally(() => setAuthChecked(true))
		} else {
			setAuthChecked(true)
		}
	}, [])
	
	const handleLogin = async (formData) => {
		const data = await api.login(formData)
		localStorage.setItem('token', data.accessToken)
		const me = await api.getMe()
		setUser(me)
	}
	
	const handleRegister = async (formData) => {
		await api.register(formData)
		await handleLogin({ email: formData.email, password: formData.password })
	}
	
	const handleLogout = () => {
		localStorage.removeItem('token')
		setUser(null)
	}
	
	if (!authChecked) return <div className="loading">Загрузка...</div>
	
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