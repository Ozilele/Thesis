class StockItem {
	constructor(
		id: number,
		ticker: string,
		companyName: string,
		price: number,
		companyDescription: string,
		companyEarnings: [],
		priceChange: number,
		isPriceChangeHigher: boolean
	) {
		this.id = id
		this.ticker = ticker
		this.companyName = companyName
		this.price = price
		this.companyDescription = companyDescription
		this.companyEarnings = companyEarnings
		this.priceChange = priceChange
		this.isPriceChangeHigher = isPriceChangeHigher
	}
}

export default StockItem
