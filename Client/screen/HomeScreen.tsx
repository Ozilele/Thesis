import { Ionicons } from "@expo/vector-icons"
import {
	Image,
	Pressable,
	SafeAreaView,
	StyleSheet,
	Text,
	TextInput,
	View,
	ScrollView,
	FlatList,
	Button,
} from "react-native"
import { useEffect, useState } from "react"
import LineChart from "../components/Charts/LineChart"
import DataBox from "../components/DataBox"
import ButtonRowContainer from "../components/ButtonRowContainer"
import StockGridTile from "../components/StockGridTile"
import { DATA } from "../data/utils"
import { DrawerActions, NavigationProp } from "@react-navigation/native"
import { StockPriceInterval, CompanyMarketView, RootStackParamList } from "../types/app-types"
import djangoApi from "../api/djangoApi"
import { useDrawerStatus } from "@react-navigation/drawer"

type HomeScreenProps = {
	navigation: NavigationProp<RootStackParamList, "Home">
	onBottomBarToggle: () => void
}

const renderStockItem = (
	item: CompanyMarketView,
	navigation: NavigationProp<RootStackParamList, "Home">,
	isLogoRequired: boolean,
	chartComponent: React.ReactNode
) => {
	const pressHandler = () => {
		navigation.navigate("StockItemScreen", {
			companyData: {
				id: item.id,
				name: item.companyName,
				logo: item.companyLogo ? item.companyLogo : "",
				ticker: item.ticker,
				...(item.companyMarket && { market: item.companyMarket }),
				...(item.companySector && { sector: item.companySector }),
			},
			priceData: {
				currPrice: item.currPrice,
				percentDiff: item.percentDiff,
				relativeDiff: item.relativeDiff,
			},
		})
	}
	return (
		<StockGridTile
			id={item.id}
			stockData={item}
			onStockItemPress={pressHandler}
			style={undefined}
			isLogoRequired={isLogoRequired}
			chartComponent={chartComponent}
		/>
	)
}

export default function HomeScreen({ navigation, onBottomBarToggle }: HomeScreenProps) {
	const [todaysMarketData, setTodaysMarketData] = useState<CompanyMarketView[]>([])
	const [biggestGainersData, setBiggestGainers] = useState<CompanyMarketView[]>([])
	const [drawerStateStatus, setDrawerStateStatus] = useState<boolean | undefined>(undefined)
	const [assetsInterval, setAssetsInterval] = useState<StockPriceInterval>(StockPriceInterval.MAX)
	const drawerStatus = useDrawerStatus()

	useEffect(() => {
		Promise.all([viewTodaysMarket(), viewBiggestGainers()])
			.then((allData) => {
				console.log("Dobrze pobrano dane")
			})
			.catch((err) => {
				console.log(err)
			})
	}, [])

	useEffect(() => {
		// onDrawerStatus change
		if (drawerStatus == "open") {
			setDrawerStateStatus(true)
			onBottomBarToggle()
		} else if (drawerStatus == "closed" && drawerStateStatus !== undefined) {
			// closed and not initial render
			setDrawerStateStatus(false)
			onBottomBarToggle()
		}
	}, [drawerStatus])

	const onMenuClick = () => {
		navigation!.dispatch(DrawerActions.toggleDrawer())
	}

	const handleNotifications = () => {}
	const handleToggleAppMode = () => {}

	const viewTheLargestIncreases = () => {
		// navigate to different screen with all movers
	}

	const viewTodaysMarket = async () => {
		try {
			const response = await djangoApi.get(`/stocks/random/?count=4`)
			const dataResponseObj = response.data.data
			const todaysMarket = []
			for (const [key, values] of Object.entries(dataResponseObj) as [string, { [key: string]: any }][]) {
				const marketItem: CompanyMarketView = {
					id: values["currPrice"]["stock"],
					companyName: key,
					ticker: values["ticker"],
					companyLogo: values["logo"],
					currPrice: parseFloat(values["currPrice"]["price"]),
					percentDiff: parseFloat(values["difference"]["percent_diff"]),
					relativeDiff: parseFloat(values["difference"]["relative_diff"]),
				}
				todaysMarket.push(marketItem)
			}
			setTodaysMarketData(todaysMarket)
			return todaysMarket
		} catch (error) {
			console.log(error)
		}
	}

	const viewBiggestGainers = async () => {
		try {
			const response = await djangoApi.get(`/stocks/top-changes/?type=increase&limit=4`)
			if (response.status === 200) {
				const data = response.data.movers
				const gainers: CompanyMarketView[] = data.map((marketMoveData: any) => {
					const move: CompanyMarketView = {
						id: marketMoveData["company"]["id"],
						companyName: marketMoveData["company"]["name"],
						ticker: marketMoveData["company"]["ticker_symbol"],
						companyLogo: marketMoveData["company"]["logo"] ? marketMoveData["company"]["logo"] : null,
						currPrice: marketMoveData["curr_price"],
						percentDiff: parseFloat(marketMoveData["percent_change"].toFixed(2)),
						relativeDiff: parseFloat(marketMoveData["relative_diff"].toFixed(2)),
						companyMarket: marketMoveData["company"]["market"],
						companySector: marketMoveData["company"]["sector"],
					}
					return move
				})
				setBiggestGainers(gainers)
				return gainers
			}
		} catch (error) {
			console.error(error)
		}
	}

	return (
		<SafeAreaView style={{ flex: 1 }}>
			<View style={styles.container}>
				<View style={styles.topContainer}>
					<Pressable onPress={onMenuClick}>
						<Ionicons size={36} color="whitesmoke" style={styles.profileImg} name="menu-outline" />
					</Pressable>
					<View style={{ flexDirection: "row", gap: 4, alignItems: "center" }}>
						<Pressable onPress={handleToggleAppMode}>
							<Ionicons name="moon" size={32} color="black" />
						</Pressable>
						<Pressable onPress={handleNotifications}>
							<Ionicons name="notifications" size={36} color="#5581F3" />
						</Pressable>
					</View>
				</View>
				<View style={styles.searchInputContainer}>
					<TextInput
						autoCorrect={false}
						autoFocus={true}
						inputMode="text"
						clearButtonMode="while-editing"
						style={styles.searchInput}
						placeholder="Search stocks, funds, etc."
						returnKeyType="search"
						placeholderTextColor="whitesmoke"
					/>
				</View>
				<ScrollView contentContainerStyle={{ paddingBottom: 54 }} style={styles.screen}>
					<View style={styles.assetsContainer}>
						<Text style={styles.assetTxt}>Asset Value</Text>
						<DataBox
							textContents={["$21,234.05", "USD"]}
							mainTxtStyle={{ color: "whitesmoke", fontSize: 36 }}
							textEndStyle={{ color: "#5482f6" }}
							timeFrame="Today"
						/>
					</View>
					<ButtonRowContainer onSelectInterval={setAssetsInterval} interval={assetsInterval} />
					<LineChart
						data={DATA}
						xKey="day"
						yKeys={["highTmp"]}
						chartConfig={{
							domainPadding: { top: 25 },
							axisOptions: {
								labelColor: "white",
								lineColor: "gray",
							},
						}}
						lineConfig={{
							color: "lightgreen",
						}}
						chartHeight={300}
						gradientColors={["green", "#90ee9050"]}
					/>
					<View style={styles.stockListContainer}>
						<Text style={styles.stockListLabel}>Today's Market</Text>
						<FlatList
							data={todaysMarketData}
							renderItem={({ item }) => renderStockItem(item, navigation, false, null)}
							keyExtractor={(item) => item.id + ""}
							numColumns={2}
							style={[styles.stockList, styles.stockListVertical]}
							scrollEnabled={false}
						/>
					</View>
					<View style={styles.stockListHorizontalContainer}>
						<View style={styles.stockTxtBtnContainer}>
							<Text style={styles.stockListLabel}>Biggest increase</Text>
							<Button onPress={viewTheLargestIncreases} color="whitesmoke" title="View all" />
						</View>
						<FlatList
							data={biggestGainersData}
							renderItem={({ item }) => renderStockItem(item, navigation, true, null)}
							keyExtractor={(item) => item.id + ""}
							horizontal={true}
							showsHorizontalScrollIndicator={false}
							initialNumToRender={2}
							style={styles.stockListHorizontal}
							scrollEnabled={true}
						/>
					</View>
				</ScrollView>
			</View>
		</SafeAreaView>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		paddingHorizontal: 12,
	},
	screen: {
		flex: 1,
	},
	topContainer: {
		marginTop: 4,
		flexDirection: "row",
		justifyContent: "space-between",
	},
	profileImg: {
		width: 40,
		height: 40,
		borderRadius: 20,
	},
	searchInputContainer: {
		marginTop: 12,
	},
	searchInput: {
		height: 60,
		backgroundColor: "#0B192C",
		borderRadius: 6,
		color: "white",
		paddingHorizontal: 12,
		fontSize: 18,
	},
	assetsContainer: {
		marginTop: 8,
		marginBottom: 12,
	},
	assetTxt: {
		color: "whitesmoke",
		fontSize: 20,
		marginBottom: 10,
		fontFamily: "roboto-medium",
	},
	stockListContainer: {
		marginTop: 12,
		paddingHorizontal: 2,
	},
	stockListLabel: {
		fontFamily: "roboto-bold",
		fontSize: 22,
		color: "whitesmoke",
	},
	stockList: {
		marginTop: 12,
		paddingTop: 12,
		paddingHorizontal: 3,
	},
	stockListVertical: {
		borderColor: "lightgray",
		borderWidth: 1,
		borderRadius: 4,
		borderStyle: "dashed",
	},
	stockListHorizontalContainer: {
		marginTop: 12,
	},
	stockTxtBtnContainer: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
	},
	stockListHorizontal: {
		marginTop: 8,
	},
})
