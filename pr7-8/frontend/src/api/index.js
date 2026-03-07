import axios from 'axios'

const apiClient = axios.create({ baseURL: 'http://localhost:3000/api' })

apiClient.interceptors.request.use(config => {
	const token = localStorage.getItem('token')
	if (token) config.headers.Authorization = `Bearer ${token}`
	return config
})

export const api = {
	async register(data) {
		const response = await apiClient.post('/auth/register', data)
		return response.data
	},
	async login(data) {
		const response = await apiClient.post('/auth/login', data)
		return response.data
	},
	async getMe() {
		const response = await apiClient.get('/auth/me')
		return response.data
	},
	
	async getProducts() {
		const response = await apiClient.get('/products')
		return response.data
	},
	async createProduct(data) {
		const response = await apiClient.post('/products', data)
		return response.data
	},
	async updateProduct(id, data) {
		const response = await apiClient.put(`/products/${id}`, data)
		return response.data
	},
	async deleteProduct(id) {
		const response = await apiClient.delete(`/products/${id}`)
		return response.data
	},
}