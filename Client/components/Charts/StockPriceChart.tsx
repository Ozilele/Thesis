import { StyleSheet, View } from "react-native"
import { useEffect, useState } from "react"
import { CartesianChart, Line } from "victory-native"
import { MarketData, StockPriceData } from "../../types/app-types"
import djangoApi from "../../api/djangoApi"

type StockPriceChartProps = {
	ticker: string
	data: StockPriceData[]
	isUp: boolean
}

function StockPriceChart({ ticker, data, isUp }: StockPriceChartProps) {
	const [priceData, setPriceData] = useState<StockPriceData[]>([])

	useEffect(() => {
		const loadChartData = async () => {
			try {
				const response = await djangoApi.get(`/stocks/prices/last/${ticker}/`)
				if (response.status === 200) {
					let chartData: StockPriceData[] = []
					if (response.data.stock_prices) {
						chartData = response.data.stock_prices.map((stockData: MarketData) => {
							return {
								stockPrice: parseFloat(stockData.price),
								timestamp: stockData.timestamp.split("T")[0],
							}
						})
						setPriceData(chartData)
					}
				}
			} catch (error) {
				console.log(error)
			}
		}
		// loadChartData()
		// query get some stock price data for short period from db or from cache
	}, [])

	return (
		<View style={styles.chartContainer}>
			<CartesianChart domainPadding={{ top: 3, bottom: 3 }} data={data} xKey={"timestamp"} yKeys={["stockPrice"]}>
				{({ points, chartBounds }) => {
					return (
						<Line
							points={points.stockPrice}
							color={isUp ? "#2ECA7E" : "#F28B82"}
							strokeWidth={3}
							curveType="natural"
							opacity={0.92}
							connectMissingData={true}
							animate={{ type: "timing", duration: 200 }}
						/>
					)
				}}
			</CartesianChart>
		</View>
	)
}

export default StockPriceChart
const styles = StyleSheet.create({
	chartContainer: {
		flex: 1,
		// height: 90,
	},
})
