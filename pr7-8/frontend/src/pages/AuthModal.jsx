import React, { useState } from 'react'

export default function AuthModal({ onClose, onLogin, onRegister }) {
	const [mode, setMode] = useState('login')
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [firstName, setFirstName] = useState('')
	const [lastName, setLastName] = useState('')
	const [error, setError] = useState('')
	
	const handleSubmit = async (e) => {
		e.preventDefault()
		setError('')
		try {
			if (mode === 'login') {
				await onLogin({ email, password })
			} else {
				await onRegister({ email, password, first_name: firstName, last_name: lastName })
			}
			onClose()
		} catch (err) {
			setError(err?.response?.data?.error || 'Ошибка. Проверьте данные.')
		}
	}
	
	return (
		<div className="auth-backdrop" onMouseDown={onClose}>
			<div className="auth-modal" onMouseDown={e => e.stopPropagation()}>
				<button className="auth-close" onClick={onClose}>✕</button>
				<h2>{mode === 'login' ? 'Вход' : 'Регистрация'}</h2>
				<form onSubmit={handleSubmit}>
					{mode === 'register' && (
						<>
							<input placeholder="Имя" value={firstName} onChange={e => setFirstName(e.target.value)} />
							<input placeholder="Фамилия" value={lastName} onChange={e => setLastName(e.target.value)} />
						</>
					)}
					<input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
					<input type="password" placeholder="Пароль" value={password} onChange={e => setPassword(e.target.value)} />
					{error && <p className="auth-error">{error}</p>}
					<button type="submit" className="btn-primary">
						{mode === 'login' ? 'Войти' : 'Зарегистрироваться'}
					</button>
				</form>
				<button className="auth-switch" onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError('') }}>
					{mode === 'login' ? 'Нет аккаунта? Зарегистрироваться' : 'Уже есть аккаунт? Войти'}
				</button>
			</div>
		</div>
	)
}