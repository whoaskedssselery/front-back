import React from 'react'

export default function ProductItem({ product, onEdit, onDelete, isAuth }) {
	return (
		<div className="item">
			<div className="item-inner">
				<p className="item-name">{product.title}</p>
				<p className="item-category">{product.category}</p>
				<p className="item-description">{product.description}</p>
				<p className="item-amount">На складе: {product.amount} шт.</p>
			</div>
			<div className="item-right-side">
				{isAuth && (
					<div className="item-actions">
						<button onClick={() => onEdit(product)}>Редактировать</button>
						<button className="btn-danger" onClick={() => onDelete(product.id)}>Удалить</button>
					</div>
				)}
				<div className="item-price">{product.price} ₽</div>
			</div>
		</div>
	)
}