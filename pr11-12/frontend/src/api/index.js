import axios from 'axios'

const apiClient = axios.create({ baseURL: 'http://localhost:3000/api' })

apiClient.interceptors.request.use(config => {
	const token = localStorage.getItem('accessToken')
	if (token) config.headers.Authorization = `Bearer ${token}`
	return config
})

apiClient.interceptors.response.use(
	response => response,
	async error => {
		const accessToken = localStorage.getItem('accessToken')
		const refreshToken = localStorage.getItem('refreshToken')
		const originalRequest = error.config
		
		if (originalRequest.url.includes('/auth/refresh')) {
			localStorage.removeItem('accessToken')
			localStorage.removeItem('refreshToken')
			window.dispatchEvent(new Event('auth:logout'))
			return Promise.reject(error)
		}
		
		// если пользователь заблокирован — выбрасываем с баном
		if (error.response?.status === 403 && error.response?.data?.error === 'User is blocked') {
			localStorage.removeItem('accessToken')
			localStorage.removeItem('refreshToken')
			window.dispatchEvent(new Event('auth:banned'))
			return Promise.reject(error)
		}
		
		if (error.response?.status === 401 && !originalRequest._retry) {
			originalRequest._retry = true
			
			if (!accessToken || !refreshToken) {
				localStorage.removeItem('accessToken')
				localStorage.removeItem('refreshToken')
				window.dispatchEvent(new Event('auth:logout'))
				return Promise.reject(error)
			}
			
			try {
				const response = await apiClient.post('/auth/refresh', { refreshToken })
				const newAccessToken = response.data.accessToken
				const newRefreshToken = response.data.refreshToken
				
				localStorage.setItem('accessToken', newAccessToken)
				localStorage.setItem('refreshToken', newRefreshToken)
				
				originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
				return apiClient(originalRequest)
			} catch (refreshError) {
				localStorage.removeItem('accessToken')
				localStorage.removeItem('refreshToken')
				window.dispatchEvent(new Event('auth:logout'))
				return Promise.reject(refreshError)
			}
		}
		
		return Promise.reject(error)
	}
)

export const api = {
	async register(data) {
		const response = await apiClient.post('/auth/register', data)
		return response.data
	},
	async login(data) {
		const response = await apiClient.post('/auth/login', data)
		return response.data
	},
	async refresh(refreshToken) {
		const response = await apiClient.post('/auth/refresh', { refreshToken })
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
	
	async getUsers() {
		const response = await apiClient.get('/users')
		return response.data
	},
	async updateUser(id, data) {
		const response = await apiClient.put(`/users/${id}`, data)
		return response.data
	},
	async blockUser(id) {
		const response = await apiClient.delete(`/users/${id}`)
		return response.data
	},
}