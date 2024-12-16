import { useCallback, useEffect, useRef, useState } from "react"
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, TextInput, View } from "react-native"
import { marketFilterOptions } from "../data/utils"
import { SafeAreaView } from "react-native-safe-area-context"
import { CompanyMarketView, MarketFilterOption, RootStackParamList, StockMarketDataState } from "../types/app-types"
import { NavigationProp } from "@react-navigation/native"
import djangoApi from "../api/djangoApi"
import StockPriceChart from "../components/Charts/StockPriceChart"
import StockGridTile from "../components/StockGridTile"
import ScrollToTopBtn from "../components/ScrollToTopBtn"
import { Ionicons } from "@expo/vector-icons"

type MarketScreenProps = {
	navigation: NavigationProp<RootStackParamList, "Market">
}

const renderMarketItem = (item: CompanyMarketView, navigation: NavigationProp<RootStackParamList, "Market">) => {
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
	const chartComponent = (
		<StockPriceChart ticker={item.ticker} data={item.chartPriceData!} isUp={item.percentDiff > 0 ? true : false} />
	)
	return (
		<StockGridTile
			id={item.id}
			stockData={item}
			onStockItemPress={pressHandler}
			style={{
				marginHorizontal: 3,
			}}
			isLogoRequired={true}
			chartComponent={chartComponent}
		/>
	)
}

export default function MarketScreen({ navigation }: MarketScreenProps) {
	const [page, setPage] = useState<number>(0)
	const [stockData, setStockData] = useState<StockMarketDataState>({
		wholeData: [],
		queriedData: [],
	})
	const [textInput, setTextInput] = useState("")
	const [activeButton, setActiveButton] = useState<string>(MarketFilterOption.ALL)
	const listRef = useRef<FlatList>(null)
	const [isDataFetching, setIsDataFetching] = useState(false)
	const [scrollBtnVisible, setScrollBtnVisible] = useState<boolean>(false)
	const [isDataQueried, setIsDataQueried] = useState<boolean>(false)
	const [offsetY, setOffsetY] = useState<number>(0)

	const loadMarketData = async () => {
		if (isDataFetching) return

		try {
			setIsDataFetching(true)
			const currPage = page + 1
			console.log("Fetching data for page " + currPage)
			const response = await djangoApi.get(`/stocks/?page=${currPage}&records=20`)

			if (response.status === 200) {
				const stockData: CompanyMarketView[] = response.data.stocks.map((stock: any) => {
					const diffString = parseFloat(parseFloat(stock.difference.relative_diff).toFixed(2))
					const stockObj: CompanyMarketView = {
						id: stock.companyData.id,
						companyName: stock.companyData.name,
						ticker: stock.companyData.ticker_symbol,
						companyLogo: stock.companyData.logo,
						currPrice: parseFloat(stock.currPrice),
						percentDiff: parseFloat(stock.difference.percent_diff),
						relativeDiff: diffString,
						companyMarket: stock.companyData.market,
						companySector: stock.companyData.sector,
						chartPriceData: stock.marketData.map((marketData: any) => ({
							timestamp: marketData.timestamp.split("T")[0],
							stockPrice: parseFloat(marketData.price),
						})),
					}
					return stockObj
				})
				setStockData((prev) => ({
					...prev,
					wholeData: [...prev.wholeData, ...stockData],
				}))
				setPage(currPage)
			}
		} catch (err) {
			console.log(err)
		} finally {
			setIsDataFetching(false)
		}
	}

	useEffect(() => {
		loadMarketData()
	}, [])

	const renderMarketOptionItem = useCallback(
		(item: string) => {
			const onButtonPress = () => {
				setActiveButton(item)
			}
			return (
				<Pressable
					style={[styles.marketFilterBtn, { backgroundColor: activeButton === item ? "#5482f6" : "#EEEEEE" }]}
					onPress={onButtonPress}
				>
					<Text
						style={{
							textAlign: "center",
							fontSize: 16,
							color: activeButton === item ? "#ffff" : "black",
						}}
					>
						{item}
					</Text>
				</Pressable>
			)
		},
		[activeButton]
	)

	const handleScroll = (event: any) => {
		const offsetY = event.nativeEvent.contentOffset.y
		setOffsetY(offsetY)
		if (offsetY > 100 && !scrollBtnVisible) {
			setScrollBtnVisible(true)
		} else if (offsetY <= 100 && scrollBtnVisible) {
			setScrollBtnVisible(false)
		}
	}

	const scrollToTop = () => {
		listRef.current?.scrollToOffset({ offset: 0, animated: true })
	}

	const scrollToOffset = (itemIndex: number) => {
		listRef.current?.scrollToOffset({
			offset: offsetY,
			animated: true,
		})
	}

	const queryByText = async (text: string) => {
		let filteredStocks: CompanyMarketView[]
		let filterType: string
		let filterValue: string
		text = text.trim()
		setTextInput(text)

		if (text.length > 0) {
			if (text.includes("$")) {
				filterType = "ticker"
				filterValue = text.replace("$", "")
			} else {
				filterType = "companyName"
				filterValue = text
			}
			if (filterType === "ticker" && text.length === 1) {
				setIsDataQueried(false)
				return
			}
			try {
				if (!isDataQueried) {
					setIsDataQueried(true)
				}
				setIsDataFetching(true)
				filteredStocks = stockData.wholeData.filter((singleStock) => singleStock[filterType]?.startsWith(filterValue))
				if (filteredStocks.length === 0) {
					setStockData((prev) => ({
						...prev,
						queriedData: [],
					}))
				} else {
					setStockData((prev) => ({
						...prev,
						queriedData: filteredStocks,
					}))
				}
			} catch (error) {
				console.log(error)
			} finally {
				setIsDataFetching(false)
			}
		} else {
			// clear input when input.lenght = 0
			setIsDataQueried(false)
		}
	}

	const handleFiltration = () => {
		// open modal with some options
	}

	return (
		<>
			<SafeAreaView edges={["top", "left", "right"]} style={{ paddingHorizontal: 8, paddingTop: 6 }}>
				<Text style={{ fontSize: 26, color: "whitesmoke", fontFamily: "roboto-medium" }}>Browse</Text>
				<View style={styles.headerRow}>
					<TextInput
						value={textInput}
						onChangeText={(text) => queryByText(text)}
						placeholder="Search by ticker: $AMD or name"
						autoFocus={true}
						autoCorrect={false}
						clearButtonMode="while-editing"
						keyboardType="default"
						placeholderTextColor="#001F3F"
						style={styles.headerInput}
					/>
					<Pressable style={styles.filterBtn} onPress={handleFiltration}>
						<Ionicons name="options-outline" size={24} color={"#3D3BF3"} />
					</Pressable>
				</View>
			</SafeAreaView>
			<View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 12, marginTop: 16 }}>
				<FlatList
					data={marketFilterOptions}
					renderItem={({ item }) => renderMarketOptionItem(item.value)}
					keyExtractor={(item, index) => index + " "}
					horizontal={true}
					scrollEnabled={true}
					showsHorizontalScrollIndicator={false}
					contentContainerStyle={{ gap: 12 }}
				/>
			</View>
			<View style={styles.marketList}>
				<FlatList
					ref={listRef}
					data={isDataQueried ? stockData.queriedData : stockData.wholeData}
					renderItem={({ item, index }) => renderMarketItem(item, navigation)}
					keyExtractor={(item) => item.id + ""}
					initialNumToRender={10}
					maxToRenderPerBatch={10}
					onScroll={handleScroll}
					ListEmptyComponent={
						!isDataFetching ? (
							<View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
								<Text style={{ fontFamily: "roboto-medium", fontSize: 20, color: "whitesmoke" }}>No data found</Text>
							</View>
						) : undefined
					}
					ListFooterComponent={
						isDataFetching ? (
							<View style={{ flexDirection: "row", justifyContent: "center", gap: 2, alignItems: "center" }}>
								<Text style={{ color: "whitesmoke", fontSize: 15 }}>Fetching data</Text>
								<ActivityIndicator size="small" color="#0000ff" />
							</View>
						) : undefined
					}
					scrollEnabled={true}
					horizontal={false}
					showsVerticalScrollIndicator={false}
					onEndReachedThreshold={0.2} // fetch data when user is 20% of the end of curr list visibility
					onEndReached={!isDataQueried ? loadMarketData : null}
				/>
			</View>
			{scrollBtnVisible && <ScrollToTopBtn handleOnTopScroll={scrollToTop} />}
		</>
	)
}

const styles = StyleSheet.create({
	marketFilterBtn: {
		alignItems: "center",
		justifyContent: "center",
		paddingHorizontal: 10,
		borderRadius: 10,
		height: 50,
		minWidth: 50,
		borderWidth: 1,
		borderColor: "#4A628A",
	},
	headerRow: {
		marginTop: 12,
		paddingHorizontal: 8,
		flexDirection: "row",
		alignItems: "center",
	},
	headerInput: {
		flex: 1,
		paddingVertical: 14,
		paddingHorizontal: 8,
		borderRadius: 8,
		fontSize: 20,
		backgroundColor: "#F5F5F7",
	},
	filterBtn: {
		marginLeft: 10,
		backgroundColor: "lightgray",
		borderRadius: 16,
		paddingHorizontal: 8,
		paddingVertical: 10,
	},
	marketList: {
		flex: 1,
		marginTop: 16,
		paddingHorizontal: 12,
	},
})
