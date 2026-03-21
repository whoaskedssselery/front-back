import React, { useState, useEffect } from 'react'
import { api } from '../api'

export default function UsersPage({ currentUserId }) {
	const [users, setUsers] = useState([])
	const [loading, setLoading] = useState(true)
	
	const loadUsers = async () => {
		try {
			setLoading(true)
			setUsers(await api.getUsers())
		} catch (err) {
			console.error('Ошибка загрузки пользователей:', err)
		} finally {
			setLoading(false)
		}
	}
	
	useEffect(() => { loadUsers() }, [])
	
	const handleRoleChange = async (id, role) => {
		try {
			const updated = await api.updateUser(id, { role })
			setUsers(prev => prev.map(u => u.id === id ? { ...u, role: updated.role } : u))
		} catch (err) {
			alert('Ошибка обновления роли')
		}
	}
	
	const handleBlock = async (id) => {
		if (!window.confirm('Заблокировать пользователя?')) return
		try {
			await api.blockUser(id)
			setUsers(prev => prev.map(u => u.id === id ? { ...u, blocked: true } : u))
		} catch (err) {
			alert('Ошибка блокировки')
		}
	}
	
	if (loading) return <div>Загрузка...</div>
	
	return (
		<div className="list">
			{users.map(u => (
				<div className="item" key={u.id}>
					<div className="item-inner">
						<p className="item-name">{u.first_name} {u.last_name}</p>
						<p className="item-category">{u.email}</p>
						<p className="item-amount">
							{u.blocked ? '🔴 Заблокирован' : '🟢 Активен'}
						</p>
					</div>
					<div className="item-right-side">
						{/* скрываем панель управления для самого админа */}
						{!u.blocked && u.id !== currentUserId && (
							<div className="item-actions">
								<select
									value={u.role}
									onChange={e => handleRoleChange(u.id, e.target.value)}
									style={{ padding: '8px', borderRadius: '10px', background: '#0f1526', color: '#e7eaf3', border: '1px solid rgba(255,255,255,0.14)' }}
								>
									<option value="user">user</option>
									<option value="seller">seller</option>
								</select>
								<button className="btn-danger" onClick={() => handleBlock(u.id)}>Заблокировать</button>
							</div>
						)}
					</div>
				</div>
			))}
		</div>
	)
}