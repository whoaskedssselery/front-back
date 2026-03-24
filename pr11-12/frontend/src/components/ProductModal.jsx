import React, { useState, useEffect } from 'react'

export default function ProductModal({ open, mode, initialProduct, onClose, onSubmit }) {
	const [title, setTitle] = useState('')
	const [category, setCategory] = useState('')
	const [description, setDescription] = useState('')
	const [price, setPrice] = useState('')
	const [amount, setAmount] = useState('')
	const [image, setImage] = useState('')
	
	useEffect(() => {
		if (!open) return
		setTitle(initialProduct?.title ?? '')
		setCategory(initialProduct?.category ?? '')
		setDescription(initialProduct?.description ?? '')
		setPrice(initialProduct?.price ?? '')
		setAmount(initialProduct?.amount ?? '')
		setImage(initialProduct?.image ?? '')
	}, [open, initialProduct])
	
	if (!open) return null
	
	const handleSubmit = (e) => {
		e.preventDefault()
		if (!title.trim()) return alert('Введите название')
		if (!category.trim()) return alert('Введите категорию')
		if (!description.trim()) return alert('Введите описание')
		if (!price || Number(price) <= 0) return alert('Введите корректную цену')
		if (amount === '' || Number(amount) < 0) return alert('Введите корректное количество')
		onSubmit({ id: initialProduct?.id, title, category, description, price: Number(price), amount: Number(amount), image })
	}
	
	return (
		<div className="backdrop" onMouseDown={onClose}>
			<div className="modal" onMouseDown={e => e.stopPropagation()}>
				<h2>{mode === 'create' ? 'Новый товар' : 'Редактировать'}</h2>
				<form onSubmit={handleSubmit}>
					<input placeholder="Название" value={title} onChange={e => setTitle(e.target.value)} />
					<input placeholder="Категория" value={category} onChange={e => setCategory(e.target.value)} />
					<input placeholder="Описание" value={description} onChange={e => setDescription(e.target.value)} />
					<input placeholder="Цена" value={price} onChange={e => setPrice(e.target.value)} />
					<input placeholder="Количество" value={amount} onChange={e => setAmount(e.target.value)} />
					{/* необязательное поле — если пусто, будет дефолтная картинка */}
					<input placeholder="Ссылка на картинку (необязательно)" value={image} onChange={e => setImage(e.target.value)} />
					<div className="modal-footer">
						<button type="button" onClick={onClose}>Отмена</button>
						<button type="submit" className="btn-primary">{mode === 'create' ? 'Создать' : 'Сохранить'}</button>
					</div>
				</form>
			</div>
		</div>
	)
}