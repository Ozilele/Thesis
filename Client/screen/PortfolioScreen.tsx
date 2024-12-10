import { Text, View, SafeAreaView, StyleSheet, ScrollView } from "react-native"
import BarChart from "../components/Charts/BarChart"
import StockGridTile from "../components/StockGridTile"
import { marketTodaysStock } from "../data/utils"
import { useEffect, useState } from "react"
import StockItemChart from "../components/Charts/StockItemChart"
import { NavigationProp, RouteProp } from "@react-navigation/native"
import { RootStackParamList } from "../types/app-types"

const data = Array.from({ length: 6 }, (_, index) => ({
	// Starting at 1 for Jaunary
	month: index + 1,
	// Randomizing the listen count between 100 and 50
	listenCount: Math.floor(Math.random() * (100 - 50 + 1)) + 50,
}))

const renderStockItem = (item, navigation, isLogoRequired) => {
	const pressHandler = () => {
		navigation.navigate("StockItemScreen", {
			stockTitle: item.companyName,
			stockTicker: item.ticker,
		})
	}
	const rnd = Math.random() * 1000
	return (
		<StockGridTile
			id={rnd}
			stockData={item}
			onStockItemPress={pressHandler}
			style={undefined}
			isLogoRequired={isLogoRequired}
			chartComponent={<StockItemChart height="100%" />}
		/>
	)
}

type StockScreenRouteProp = RouteProp<RootStackParamList, "Portfolio">
type StockScreenNavigationProp = NavigationProp<RootStackParamList, "Portfolio">
type PortfolioScreenProps = {
	route: StockScreenRouteProp
	navigation: StockScreenNavigationProp
}

function PortfolioScreen({ route, navigation }: PortfolioScreenProps) {
	const [assets, setAssets] = useState([])

	useEffect(() => {
		// get the stocks which current user holds in its portfolio
	}, [])

	return (
		<SafeAreaView style={styles.screen}>
			<ScrollView style={styles.screen}>
				<View style={styles.portfolioScreenContainer}>
					<Text style={styles.portfolioTxt}>Portfolio Monthly Statistics</Text>
					<BarChart data={data} xKey="month" yKeys={["listenCount"]} />
					{/* <View style={styles.portfolioAssets}>
						<Text style={styles.portfolioTxt}>Stocks</Text>
						<FlatList
							data={marketTodaysStock}
							extraData={assets}
							renderItem={({ item }) => renderStockItem(item, navigation, true)}
							keyExtractor={(item) => item.id}
							style={styles.stockAssetsList}
							scrollEnabled={false}
							// style={styles.stockListHorizontal}
						/>
					</View> */}
				</View>
			</ScrollView>
		</SafeAreaView>
	)
}

export default PortfolioScreen
const styles = StyleSheet.create({
	screen: {
		flex: 1,
	},
	portfolioScreenContainer: {
		flex: 1,
		paddingHorizontal: 12,
		width: "100%",
		marginTop: 10,
	},
	portfolioTxt: {
		fontFamily: "roboto-medium",
		fontSize: 18,
		color: "whitesmoke",
	},
	portfolioAssets: {
		marginTop: 12,
	},
	stockAssetsList: {
		marginTop: 12,
	},
})
