import React, { createContext, ReactNode, useContext, useEffect, useState } from "react"
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from "@env"
import djangoApi, { refreshAccessToken } from "../../api/djangoApi"
import { verifyToken } from "../../utils/auth-helpers"
import * as SecureStore from "expo-secure-store"

interface AuthContextType {
	authState?: { token: string | null; authenticated: boolean | null }
	onRegister?: (username: string, email: string, password: string) => Promise<any>
	onLogin?: (email: string, password: string) => Promise<any>
	onLogout?: () => Promise<any>
}

const AuthContext = createContext<AuthContextType>({})

export const useAuth = () => {
	return useContext(AuthContext)
}
type AuthProviderProps = {
	children: ReactNode
}

const AuthProvider = ({ children }: AuthProviderProps) => {
	const [authState, setAuthState] = useState<{
		// token is the current access token for the logged in user
		token: string | null
		authenticated: boolean | null
	}>({
		token: null,
		authenticated: null,
	})

	const setUnAuthenticatedState = () => {
		setAuthState({
			token: null,
			authenticated: false,
		})
	}

	useEffect(() => {
		const loadToken = async () => {
			const token = await SecureStore.getItemAsync(ACCESS_TOKEN_KEY)
			if (token) {
				const isValid = verifyToken(token)
				console.log("Is valid: " + isValid)
				if (!isValid) {
					// try getting new access token based on refresh token
					const refreshToken = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY)
					if (refreshToken) {
						await tryRefreshToken(refreshToken)
					} else {
						await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY)
						setUnAuthenticatedState()
					}
					return
				}
				// add interceptors, defaults headers
				setAuthState({
					token: token,
					authenticated: true,
				})
			} else {
				setUnAuthenticatedState()
			}
		}
		loadToken()
	}, [])

	const tryRefreshToken = async (refreshToken: string) => {
		try {
			const accessToken = await refreshAccessToken(refreshToken)
			console.log("New access token: " + accessToken)
			if (accessToken) {
				await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken)
				setAuthState({
					token: accessToken,
					authenticated: true,
				})
			}
		} catch (err) {
			await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY)
			setUnAuthenticatedState()
		}
	}

	const login = async (email: string, password: string) => {
		try {
			const response = await djangoApi.post(`/auth/token/`, { email, password })
			if (response.status === 200) {
				setAuthState({
					token: response.data.access,
					authenticated: true,
				})
			}
			// axios interceptors
			await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, response.data.access)
			await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, response.data.refresh)
			return response
		} catch (err) {
			return { error: true, msg: (err as any).response.data.msg }
		}
	}

	const register = async (username: string, email: string, password: string) => {
		try {
			return await djangoApi.post(`/auth/register/`, { username, email, password })
		} catch (err) {
			return { error: true, msg: (err as any).response.data.msg }
		}
	}

	const logout = async () => {
		await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY) // delete access and refresh Tokens
		await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY)
		setUnAuthenticatedState()
	}

	const contextValue = {
		authState: authState,
		onRegister: register,
		onLogin: login,
		onLogout: logout,
	}
	return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
}

export default AuthProvider
