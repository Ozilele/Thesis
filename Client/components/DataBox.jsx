import { View, StyleSheet, Text } from "react-native"
import { Ionicons } from "@expo/vector-icons"

function DataBox({ textContents, mainTxtStyle, textEndStyle, timeFrame }) {
	return (
		<View style={styles.boxContainer}>
			<View style={styles.leftContainer}>
				<Text style={[styles.textContent, mainTxtStyle]}>
					{textContents[0]}
				</Text>
				<View style={styles.updateDataBox}>
					<Ionicons name="chevron-up-circle-outline" color="green" size={22} />
					<Text style={styles.changePortfolioTxt}>$32.85(4.78%)</Text>
					{/* Get this data from backend when querying
          today's portfolio return, weekly ret, 1m, 3m, all, etc. */}
					<Text style={{ color: "whitesmoke", marginLeft: 2 }}>
						{timeFrame}
					</Text>
				</View>
			</View>
			<View style={styles.rightContainer}>
				<Text style={[styles.textEnd, textEndStyle]}>{textContents[1]}</Text>
			</View>
		</View>
	)
}

export default DataBox
const styles = StyleSheet.create({
	boxContainer: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
	},
	leftContainer: {
		flexDirection: "column",
		justifyContent: "center",
	},
	textContent: {
		fontFamily: "roboto-bold",
		fontSize: 32,
	},
	updateDataBox: {
		flexDirection: "row",
		alignItems: "center",
		gap: 3,
	},
	changePortfolioTxt: {
		color: "#0de57d",
	},
	textEnd: {
		fontSize: 20,
		fontFamily: "inter-light",
	},
})
