import { useState } from "react"
import { Pressable, StyleSheet, Text, View } from "react-native"
import { stockDataPeriods } from "../data/utils"
import { StockPriceInterval } from "../types/app-types"

type ButtonRowContainerProps = {
	interval: StockPriceInterval
	onSelectInterval: React.Dispatch<React.SetStateAction<StockPriceInterval>>
}

function ButtonRowContainer({ interval, onSelectInterval }: ButtonRowContainerProps) {
	const [activeBtn, setActiveBtn] = useState(interval)

	const queryStockPeriodData = (period: StockPriceInterval) => {
		setActiveBtn(period)
		// query current stock data to apply changes on chart etc.
		onSelectInterval(period)
	}

	return (
		<View style={styles.buttonsContainer}>
			{stockDataPeriods.map((stockPeriod) => {
				return (
					<Pressable
						key={stockPeriod}
						style={[styles.btnContainer, activeBtn === stockPeriod && styles.btnActive]}
						onPress={(e) => queryStockPeriodData(stockPeriod)}
					>
						<Text style={[styles.btnText, { color: activeBtn === stockPeriod ? "white" : "gray" }]}>{stockPeriod}</Text>
					</Pressable>
				)
			})}
		</View>
	)
}

export default ButtonRowContainer

const styles = StyleSheet.create({
	buttonsContainer: {
		flexDirection: "row",
		justifyContent: "space-evenly",
		alignItems: "center",
		backgroundColor: "#3C4454",
		borderRadius: 4,
		paddingHorizontal: 4,
		paddingVertical: 6,
		marginBottom: 12,
	},
	btnContainer: {
		flex: 1,
		paddingVertical: 12,
		paddingHorizontal: 4,
		backgroundColor: "transparent",
		borderRadius: 6,
		// color: "white",
		// flexDirection: "row",
		// backgroundColor: "#404B5C",
	},
	btnActive: {
		backgroundColor: "#213140",
	},
	btnText: {
		textAlign: "center",
		color: "white",
		fontSize: 14,
	},
})
