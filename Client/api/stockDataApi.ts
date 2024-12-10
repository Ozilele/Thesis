import { StockPriceInterval, StockPriceData } from "../types/app-types"
import axios from "axios"

export const makeStockPriceApiCall = async (
	API_URL: string,
	response_key: string,
	last_queried_date_string: string | null = null
) => {
	try {
		const res = await fetchStockData(API_URL)
		const timeSeriesObj = res[response_key]
		const lastQueriedDate = last_queried_date_string ? new Date(last_queried_date_string) : null
		let chartData: StockPriceData[] = []
		let prev_date: Date | null = null
		for (const [key, value] of Object.entries(timeSeriesObj)) {
			const currDate = new Date(key)
			const closeValue = Math.round(Number.parseFloat(value["4. close"]) * 100) / 100
			currDate.setUTCHours(0, 0, 0, 0)

			if (lastQueriedDate && currDate < lastQueriedDate) {
				break
			}
			if (prev_date && prev_date.getDate() - 3 === currDate.getDate()) {
				let tmp_date = null
				let tmpArr = []
				if (response_key.includes("Daily")) {
					tmp_date = new Date(currDate)
					tmp_date.setUTCHours(0, 0, 0, 0)
					tmp_date.setDate(tmp_date.getDate() + 1)

					while (tmp_date.getDate() !== prev_date.getDate()) {
						tmpArr.push({
							timestamp: tmp_date.toISOString().split("T")[0],
							stockPrice: closeValue,
						})
						tmp_date.setDate(tmp_date.getDate() + 1)
					}
					tmpArr.reverse()
					chartData = chartData.concat(tmpArr)
				}
			}
			chartData.push({
				timestamp: key.includes(" ") ? key.split(" ")[1] : key,
				stockPrice: closeValue,
			})
			prev_date = new Date(currDate)
			// else if (response_key.includes("60min")) {
			// 	// tmp_date = new Date()
			// 	// let currHour = 4
			// 	// while(tmp_date.getDate() !== currDate.getDate()) {
			// 	// 	for(let i = 0; i < 16; i++) {
			// 	// 		chartData.push({
			// 	// 			timestamp:
			// 	// 			stockPrice: lastCloseValue,
			// 	// 		})
			// 	// 	}
			// 	// }
			// }
		}
		chartData.reverse()
		const stockValueAgo = chartData[0].stockPrice
		const stockValueNow = chartData[chartData.length - 1].stockPrice
		let stockPercentChange = "0%"
		let stockPriceChange = "0"
		if (stockValueAgo > stockValueNow) {
			stockPriceChange = "-" + (stockValueAgo - stockValueNow).toFixed(2)
			stockPercentChange = "-" + Math.round(((stockValueAgo - stockValueNow) / stockValueAgo) * 100).toFixed(2) + "%"
		} else {
			stockPriceChange = (stockValueNow - stockValueAgo).toFixed(2)
			stockPercentChange = Math.round(((stockValueNow - stockValueAgo) / stockValueAgo) * 100).toFixed(2) + "%"
		}
		return {
			chartData,
			stockPriceChange,
			stockPercentChange,
		}
	} catch (err) {
		console.log("Error happened")
		console.log(err)
		return null
	}
}

const fetchStockData = async (API_URL: string) => {
	const response = await axios.get(API_URL)
	console.log(response)
	if (response.status === 200) {
		return response.data
	} else {
		throw new Error(response.data)
	}
}
