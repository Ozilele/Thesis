import { Ionicons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import { View, StyleSheet, Pressable, Text, ViewStyle } from "react-native"
import StockCompanyLogo from "../components/StockCompanyLogo"
import { CompanyMarketView } from "../types/app-types"
import { memo } from "react"

type StockGridTileProps = {
	id: number
	stockData: CompanyMarketView
	onStockItemPress: () => void
	style?: ViewStyle
	isLogoRequired: boolean
	chartComponent: React.ReactNode | null
}

function StockGridTile({ id, stockData, onStockItemPress, style, isLogoRequired, chartComponent }: StockGridTileProps) {
	const marketToday = stockData as CompanyMarketView

	return (
		<Pressable
			android_ripple={{ color: "#ccc" }}
			style={({ pressed }) => [styles.stockButton, pressed ? styles.buttonPressed : null]}
			onPress={onStockItemPress}
		>
			<LinearGradient
				colors={["#323C55", "#30394C", "#282A36"]}
				style={[
					styles.gridItem,
					isLogoRequired && { paddingVertical: 24 },
					style?.marginHorizontal && { marginHorizontal: style?.marginHorizontal },
				]}
			>
				{isLogoRequired && (
					<View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
						<StockCompanyLogo url={stockData.companyLogo ? stockData.companyLogo : ""} />
						<View style={styles.tickerNameTxtContainer}>
							<Text
								style={{
									color: "whitesmoke",
									fontSize: 16,
									fontFamily: "roboto-medium",
								}}
							>
								{stockData.ticker}
							</Text>
							<Text
								style={{
									color: "#E4E0E1",
									fontSize: 14,
								}}
								numberOfLines={1}
								ellipsizeMode="tail"
							>
								{stockData.companyName}
							</Text>
						</View>
						<View style={styles.chartAreaContainer}>{chartComponent}</View>
						<View style={{ alignItems: "center", marginLeft: 1 }}>
							<Text style={styles.rowStockPrice}>{`$${stockData.currPrice}`}</Text>
							<View style={{ flexDirection: "row", alignItems: "center" }}>
								<Ionicons
									name={stockData.percentDiff > 0 ? "arrow-up-outline" : "arrow-down-outline"}
									size={20}
									color={stockData.percentDiff > 0 ? "#2DCE5A" : "#E34646"}
								/>
								<Text
									style={[styles.priceChangeTxt, { color: stockData.percentDiff > 0 ? "#2DCE5A" : "#E34646" }]}
								>{`${stockData.percentDiff.toFixed(2)}%`}</Text>
							</View>
						</View>
					</View>
				)}
				{!isLogoRequired && (
					<View style={{ gap: 10 }}>
						<View style={styles.gridTileRow}>
							<Text style={styles.stockNameText}>{marketToday.ticker}</Text>
							<Text
								style={[
									styles.percentChangeTxt,
									marketToday.percentDiff <= 0 ? { color: "#E34646" } : { color: "#2DCE5A" },
								]}
							>
								{`${marketToday.percentDiff}%`}
							</Text>
						</View>
						<View style={styles.gridTileRow}>
							<Text style={styles.priceTxt}>{`$${marketToday.currPrice}`}</Text>
							<Ionicons
								name={marketToday.percentDiff > 0 ? "arrow-up-outline" : "arrow-down-outline"}
								size={20}
								color={marketToday.percentDiff > 0 ? "#2DCE5A" : "#E34646"}
							/>
						</View>
					</View>
				)}
			</LinearGradient>
		</Pressable>
	)
}

export default memo(StockGridTile)

const styles = StyleSheet.create({
	stockButton: {
		flex: 1,
	},
	buttonPressed: {
		opacity: 0.7,
	},
	gridItem: {
		flex: 1,
		marginBottom: 12,
		marginHorizontal: 6,
		borderRadius: 8,
		paddingVertical: 18,
		paddingHorizontal: 8,
	},
	gridTileRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
	},
	stockNameText: {
		fontSize: 16,
		color: "white",
	},
	percentChangeTxt: {
		fontSize: 16,
		fontFamily: "roboto-medium",
	},
	priceTxt: {
		fontFamily: "roboto-medium",
		fontSize: 16,
		color: "whitesmoke",
	},
	tickerNameTxtContainer: {
		justifyContent: "center",
		gap: 3,
		width: 90,
	},
	rowStockPrice: {
		fontFamily: "roboto-bold",
		fontSize: 16,
		color: "whitesmoke",
	},
	chartAreaContainer: {
		flex: 1,
		marginRight: 6,
	},
	priceChangeTxt: {
		color: "#2DCE5A",
		fontFamily: "roboto-medium",
	},
})
