import React from 'react'
import { useState, useEffect } from 'react'
import { api } from '../api'
import ProductList from '../components/ProductList'
import ProductModal from '../components/ProductModal'

export default function ProductsPage() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState('create')
  const [editingProduct, setEditingProduct] = useState(null)

  const loadProducts = async () => {
      try {
         setLoading(true)
         setProducts(await api.getProducts())
      } catch (err) {
         console.error('Ошибка:', err);
      } finally {
         setLoading(false)
      }
   }

   useEffect(() => {
      loadProducts()
   }, [])

   const openCreate = () => {
      setModalMode('create')
      setEditingProduct(null)
      setModalOpen(true)
   }

   const openEdit = (product) => {
      setModalMode('edit')
      setEditingProduct(product)
      setModalOpen(true)
   }

   const closeModal = () => {
      setModalOpen(false)
      setEditingProduct(null)
   }

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
            <button onClick={openCreate}>+ Добавить товар</button>
            </header>
         <main>
            {loading ? <div>Загрузка...</div> : (
               <ProductList products={products} onEdit={openEdit} onDelete={handleDelete} />
            )}
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