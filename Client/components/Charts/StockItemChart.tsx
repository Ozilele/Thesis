import { StyleSheet, View } from "react-native"
import { CartesianChart, Line } from "victory-native"
import { shortStockData } from "../../data/utils"
import { useEffect } from "react"

function StockItemChart({ height }) {
	useEffect(() => {
		// query get some stock price data for short period from db or from cache
	}, [])

	return (
		<View style={[styles.chartContainer, { height: height }]}>
			<CartesianChart data={shortStockData} xKey={"timestamp"} yKeys={["stockPrice"]}>
				{({ points, chartBounds }) => {
					return <Line points={points.stockPrice} color={"#2ECA7E"} strokeWidth={3} />
				}}
			</CartesianChart>
		</View>
	)
}

export default StockItemChart
const styles = StyleSheet.create({
	chartContainer: {
		flex: 1,
	},
})
