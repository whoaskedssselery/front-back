import React from 'react'

// canEdit — seller и admin, canDelete — только admin
export default function ProductItem({ product, onEdit, onDelete, canEdit, canDelete }) {
	return (
		<div className="item">
			<div className="item-inner">
				<p className="item-name">{product.title}</p>
				<p className="item-category">{product.category}</p>
				<p className="item-description">{product.description}</p>
				<p className="item-amount">На складе: {product.amount} шт.</p>
			</div>
			<div className="item-right-side">
				{(canEdit || canDelete) && (
					<div className="item-actions">
						{canEdit && <button onClick={() => onEdit(product)}>Редактировать</button>}
						{canDelete && <button className="btn-danger" onClick={() => onDelete(product.id)}>Удалить</button>}
					</div>
				)}
				<div className="item-price">{product.price} ₽</div>
			</div>
		</div>
	)
}