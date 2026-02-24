import axios from 'axios'

const apiClient = axios.create({ baseURL: 'http://localhost:3000/api' })

export const api = {
   async getProducts() { // получение всех товаров
      const response = await apiClient.get('/products')
      return response.data
   },
   async createProduct(data) { // создание товара
      const response = await apiClient.post('/products', data)
      return response.data
   },
   async updateProduct(id, data) { // обновление товара
      const response = await apiClient.patch(`/products/${id}`, data)
      return response.data
   },
   async deleteProduct(id) { // удаление товара
      const response = await apiClient.delete(`/products/${id}`)
      return response.data
   },
}