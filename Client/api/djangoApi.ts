import axios from "axios"
import * as SecureStore from "expo-secure-store"
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY, DJANGO_API_URL } from "@env"

const djangoApi = axios.create({
	baseURL: DJANGO_API_URL,
})

djangoApi.interceptors.request.use(
	async (config) => {
		const authToken = await SecureStore.getItemAsync(ACCESS_TOKEN_KEY)
		if (authToken) {
			config.headers.Authorization = `Bearer ${authToken}`
		}
		return config
	},
	(error: any) => {
		return Promise.reject(error)
	}
)

export let authResponseInterceptor: number | null = null
export const setupAPIResponseInterceptor = () => {
	authResponseInterceptor = djangoApi.interceptors.response.use(
		(response) => response,
		async (error) => {
			if (axios.isAxiosError(error)) {
				console.log("Axios " + error.status) // ERROR_BAD_REQUEST
			}
			if (axios.isAxiosError(error)) {
				// status === 401
				// Handling unauthorized access response trying to access protected routes on API
				if (error.status == 401) {
					try {
						const refreshToken = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY)
						if (refreshToken) {
							const newToken = await refreshAccessToken(refreshToken)
							if (newToken) {
								console.log("Successfully refreshed token in response interceptor")
								await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, newToken)
								error.config.headers["Authorization"] = `Bearer ${newToken}` // adding newly token to request headers
								return axios(error.config) // retry the original request after refreshing the token
							}
						} else {
							console.log("Error response from interceptor(No refresh token detected)")
							throw new Error("Refresh token not found")
						}
					} catch (error) {
						return Promise.reject(error)
					}
				}
			}
			return Promise.reject(error)
		}
	)
}

setupAPIResponseInterceptor()

export const refreshAccessToken = async (refreshToken: string) => {
	if (authResponseInterceptor != null) {
		// eject the interceptor
		djangoApi.interceptors.response.eject(authResponseInterceptor)
	}
	try {
		const response = await djangoApi.post("/auth/token/refresh/", { refresh: refreshToken })
		if (response.status === 200) {
			return response.data.access
		}
		return Promise.reject(response.status + " " + response.statusText)
	} catch (err: any) {
		return Promise.reject(err)
	} finally {
		if (authResponseInterceptor == null) {
			setupAPIResponseInterceptor()
		}
	}
}
export default djangoApi
