import "core-js/stable/atob"
import { jwtDecode } from "jwt-decode"

export const verifyToken = (token: string) => {
	const decoded = jwtDecode(token)
	const tokenExpiration = decoded.exp
	const now = Date.now() / 1000 // to seconds
	if (tokenExpiration && tokenExpiration < now) {
		// access token expired, try refreshing
		return false
	}
	return true
}
