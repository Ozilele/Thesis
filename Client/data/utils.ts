import { StockPriceInterval, StockInfoData, MarketFilterOption } from "../types/app-types"

export const DATA = Array.from({ length: 31 }, (_, i) => ({
	day: i,
	highTmp: 40 + 30 * Math.random(),
}))

export const stockDataPeriods = [
	StockPriceInterval.ONE_DAY,
	StockPriceInterval.SEVEN_DAY,
	StockPriceInterval.ONE_MONTH,
	StockPriceInterval.THREE_MONTH,
	StockPriceInterval.HALF_YEAR,
	StockPriceInterval.FROM_YEAR,
	StockPriceInterval.ONE_FULL_YEAR,
	StockPriceInterval.FIVE_YEAR,
	StockPriceInterval.MAX,
]

export const companyFilters = [
	StockInfoData.OVERVIEW,
	StockInfoData.NEWS,
	StockInfoData.FINANCIAL,
	StockInfoData.TECHNICAL,
]

export const marketFilterOptions = [
	{ id: 1, value: MarketFilterOption.ALL },
	{ id: 2, value: MarketFilterOption.TRENDING },
	{ id: 3, value: MarketFilterOption.PROFIT },
	{ id: 4, value: MarketFilterOption.LOSS },
	{ id: 5, value: MarketFilterOption.NEWEST },
	{ id: 6, value: MarketFilterOption.NYSE },
	{ id: 7, value: MarketFilterOption.NASDAQ },
]

export function convertToInternationalCurrencySystem(labelValue: number) {
	return Number(labelValue) >= 1.0e9
		? (Number(labelValue) / 1.0e9).toFixed(2) + "B"
		: Number(labelValue) >= 1.0e6
			? (Number(labelValue) / 1.0e6).toFixed(2) + "M"
			: Number(labelValue) >= 1.0e3
				? (Number(labelValue) / 1.0e3).toFixed(2) + "K"
				: Number(labelValue)
}

const getPastMonthDate = (months: number) => {
	const curr_date = new Date()
	let months_ago: string | Date = new Date()
	months_ago.setMonth(curr_date.getMonth() - months)
	return months_ago.toISOString().split("T")[0]
}

const getLastPossibleYearDate = (years: number) => {
	const curr_date = new Date()
	let years_ago: string | Date = new Date()
	years_ago.setFullYear(curr_date.getFullYear() - years, curr_date.getMonth(), curr_date.getDate())
	return years_ago.toISOString().split("T")[0]
}

export function getFromDate(queryType: string, queryCount: number | null) {
	let lastDate = ""
	switch (queryType) {
		case "Y": {
			lastDate = getLastPossibleYearDate(queryCount!) // 1Y,5Y
			break
		}
		case "M": {
			lastDate = getPastMonthDate(queryCount!) // 1M,3M,6M
			break
		}
		case "YTD": {
			// YTD case
			let ytd_date = new Date()
			ytd_date.setMonth(0)
			ytd_date.setDate(1)
			lastDate = ytd_date.toISOString().split("T")[0]
			break
		}
		case "D": {
			// 1D,7D
			let date = new Date()
			date.setDate(date.getDate() - queryCount!)
			lastDate = date.toISOString().split("T")[0]
			break
		}
	}
	return lastDate
}
