export enum StockPriceInterval {
	ONE_DAY = "1D",
	SEVEN_DAY = "7D",
	ONE_MONTH = "1M",
	THREE_MONTH = "3M",
	HALF_YEAR = "6M",
	FROM_YEAR = "YTD",
	ONE_FULL_YEAR = "1Y",
	FIVE_YEAR = "5Y",
	MAX = "MAX",
}

export enum StockInfoData {
	OVERVIEW = "Overview",
	NEWS = "News",
	FINANCIAL = "Financial",
	TECHNICAL = "Technical",
}

export enum MarketFilterOption {
	ALL = "All",
	TRENDING = "Trending",
	PROFIT = "Profit",
	LOSS = "Loss",
	NEWEST = "Newest",
	NYSE = "Nyse",
	NASDAQ = "Nasdaq",
}

export enum AppTheme {
	DARK = "dark",
	LIGHT = "light",
}

export type StockPriceData = {
	timestamp: string
	stockPrice: number
}

export type StockMainData = {
	currentPrice: number
	stockPriceChange: number
	stockPercentChange: number
}

export interface StockMarketDataState {
	wholeData: CompanyMarketView[]
	queriedData: CompanyMarketView[]
}

export enum AuthFormMode {
	LOGIN = "Login",
	REGISTER = "Register",
}

export type AuthInputElement = {
	label: string
	inputKey: "username" | "email" | "password" | "confirm_password"
	autoCorrectOption: boolean
}

export type RootStackParamList = {
	Login: undefined
	Register: undefined
	Home: undefined
	Market: undefined
	Portfolio: undefined
	FollowedList: undefined
	StockItemScreen: {
		companyData: {
			id: number
			name: string
			logo: string
			ticker: string
			market?: string
			sector?: string
		}
		priceData: {
			currPrice: number
			percentDiff: number
			relativeDiff: number
		}
	}
}

export type AuthInputs = {
	username?: string
	email: string
	password: string
	confirm_password?: string
}

export type CompanyMarketView = {
	id: number
	companyName: string
	ticker: string
	companyLogo: string | null
	currPrice: number
	percentDiff: number
	relativeDiff: number
	companyMarket?: string
	companySector?: string
	chartPriceData?: StockPriceData[]
}

export type CompanyOverviewItem = {
	id: number
	label: string
	data: string
}

export type CompanyNews = {
	id: number
	author: string
	urlImage: URL
}

export type CompanyFinancialData = {
	id: number
	netIncome: number
	operatingIncome: number
	totalRevenue: number
	timestamp: string
}

export type CompanyTechnical = {
	tech: string
}

export type MarketData = {
	id: number
	price: string
	volume: number
	timestamp: string
}

export type CompanyInfo = {
	overview: CompanyOverviewItem[]
	news: CompanyNews[]
	financial: CompanyFinancialData[]
	technical: CompanyTechnical[]
}
