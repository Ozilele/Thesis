import React, { createContext, useContext, useEffect, useState, ReactNode } from "react"
import djangoApi from "../../api/djangoApi"

interface WatchListContextType {
	watchlistState?: { tickers: any[] }
	addToWatchList?: (stockTicker: string) => void
	removeFromWatchList?: (stockTicker: string) => void
	saveToServer?: (companyId: number) => Promise<any>
	removeFromServer?: (companyId: number) => Promise<any>
}

const WatchListContext = createContext<WatchListContextType>({})

export const useWatchList = () => {
	return useContext(WatchListContext)
}

type WatchListProviderProps = {
	children: ReactNode
}

const WatchListProvider = ({ children }: WatchListProviderProps) => {
	const [watchedTickers, setWatchedTickers] = useState<any[]>([])

	useEffect(() => {
		const loadWatchedTickers = async () => {
			try {
				const response = await djangoApi.get(`/stocks/watchlist/`)
				if (response.status === 200) {
					console.log(response.data)
					console.log(response.data.companies)
					setWatchedTickers(response.data.companies)
				}
			} catch (error) {
				return { error: true, msg: (error as any).response.data.msg }
			}
		}
		loadWatchedTickers()
	}, [])

	const addTickerToWatchList = (stockTicker: string) => {
		setWatchedTickers((prevTickers) => [...prevTickers, stockTicker])
	}

	const removeTickerFromWatchList = (stockTicker: string) => {
		setWatchedTickers((prevTickers) => prevTickers.filter((ticker) => ticker !== stockTicker))
	}

	const saveToWatchList = async (companyId: number) => {
		try {
			const response = await djangoApi.post(`/stocks/watchlist/`, {
				company: companyId,
			})
			if (response.status === 201) {
				return response
			}
			return { error: true, msg: "Error saving company to watchlist" }
		} catch (err) {
			return { error: true, msg: (err as any).response.data.msg }
		}
	}

	const removeFromServer = async (companyId: number) => {
		try {
			const response = await djangoApi.delete(`/stocks/watchlist/?companyId=${companyId}`)
			if (response.status === 204) {
				return response
			}
			return { error: true, msg: "Error removing company from watchlist" }
		} catch (err) {
			return { error: true, msg: (err as any).response.data.msg }
		}
	}

	const contextValue = {
		watchlistState: watchedTickers,
		addToWatchList: addTickerToWatchList,
		removeFromWatchList: removeTickerFromWatchList,
		saveToServer: saveToWatchList,
		removeFromServer,
	}
	return <WatchListContext.Provider value={contextValue}>{children}</WatchListContext.Provider>
}

export default WatchListProvider
