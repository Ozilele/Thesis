import { useEffect, useMemo, useRef, useState } from "react"
import { Text, View, SafeAreaView, StyleSheet, Pressable, FlatList, ScrollView } from "react-native"
import {
	StockPriceInterval,
	StockPriceData,
	StockMainData,
	RootStackParamList,
	StockInfoData,
	CompanyOverviewItem,
	MarketData,
	CompanyInfo,
	CompanyFinancialData,
} from "../types/app-types"
import { RouteProp, NavigationProp } from "@react-navigation/native"
import { getFromDate, companyFilters } from "../data/utils"
import { Ionicons } from "@expo/vector-icons"
import { format } from "date-fns"
import StockCompanyLogo from "../components/StockCompanyLogo"
import ButtonRowContainer from "../components/ButtonRowContainer"
import LineChart from "../components/Charts/LineChart"
import FilterList from "../components/FilterList"
import djangoApi from "../api/djangoApi"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import OptionsBottomSheet from "../components/OptionsBottomSheet"
import BarChart from "../components/Charts/BarChart"

type StockScreenRouteProp = RouteProp<RootStackParamList, "StockItemScreen">
type StockScreenNavigationProp = NavigationProp<RootStackParamList, "StockItemScreen">
type StockScreenProps = {
	route: StockScreenRouteProp
	navigation: StockScreenNavigationProp
}
const renderOverviewItem = (item: CompanyOverviewItem, index: number) => {
	return (
		<View
			id={item.id + ""}
			style={[styles.dataInfoItem, index % 2 === 0 ? { alignItems: "flex-start" } : { alignItems: "flex-end" }]}
		>
			<Text style={{ color: "#E4E0E1", fontSize: 14 }}>{item.label}</Text>
			<Text style={{ color: "whitesmoke", fontSize: 17 }}>{item.data}</Text>
		</View>
	)
}

function StockScreen({ route, navigation }: StockScreenProps) {
	const { companyData, priceData } = route.params
	const [stockPriceInterval, setStockPriceInterval] = useState<StockPriceInterval>(StockPriceInterval.ONE_FULL_YEAR) // 7D, 1M, 3M, 6M, YTD, 1Y, 5Y, MAX
	const [companySelectedFilter, setCompanySelectedFilter] = useState<StockInfoData>(StockInfoData.OVERVIEW)
	const [chartPriceData, setChartPriceData] = useState<StockPriceData[]>([]) // price data
	const [companyInfoData, setCompanyInfoData] = useState<CompanyInfo>({
		overview: [],
		news: [],
		financial: [],
		technical: [],
	}) // company
	const [stockData, setStockData] = useState<StockMainData>({
		// stock data
		currentPrice: priceData.currPrice,
		stockPriceChange: priceData.relativeDiff,
		stockPercentChange: priceData.percentDiff,
	})
	const isPriceDown = stockData.stockPercentChange < 0 ? true : false

	useEffect(() => {
		// To do - cachowanie requestów na froncie -> nie ciągłe odpytywanie bazy
		const loadPriceData = async () => {
			let queryType = ""
			let queryCount = null
			let fromDate = ""
			if (stockPriceInterval === StockPriceInterval.FROM_YEAR) {
				queryType = "YTD"
			} else if (
				stockPriceInterval.includes("Y") ||
				stockPriceInterval.includes("M") ||
				stockPriceInterval.includes("D")
			) {
				queryCount = parseInt(stockPriceInterval[0])
				queryType = stockPriceInterval[1]
			}
			if (stockPriceInterval !== StockPriceInterval.MAX) {
				fromDate = getFromDate(queryType, queryCount)
			} else {
				fromDate = "MAX"
			}
			console.log("From: " + fromDate)
			try {
				const response = await djangoApi.get(`/stocks/prices/${companyData.ticker}/?from_date=${fromDate}`)
				if (response.status === 200) {
					setStockData((prev) => {
						return {
							...prev,
							stockPriceChange: parseFloat(response.data.stock_relative_diff),
							stockPercentChange: parseFloat(response.data.stock_percent_diff),
						}
					})
					const chartData: StockPriceData[] = response.data.stock_prices.map((stockData: MarketData) => {
						return {
							stockPrice: parseFloat(stockData.price),
							timestamp: stockData.timestamp.split("T")[0],
						}
					})
					setChartPriceData(chartData)
				}
			} catch (error) {
				console.log(error)
			}
		}
		loadPriceData()
	}, [stockPriceInterval])

	useEffect(() => {
		getCompanyInfo()
	}, [companySelectedFilter])

	const getCompanyInfo = async () => {
		let dataInfo = []
		switch (companySelectedFilter) {
			case StockInfoData.OVERVIEW: {
				try {
					const response = await djangoApi.get(`/stocks/${companyData.ticker}/`)
					if (response.status === 200) {
						const companyKeys = ["market", "sector", "sentiment"]
						const company = response.data.company
						const info = response.data.companyInfo
						let id = 1
						for (let [key, value] of Object.entries(company) as [string, string | number][]) {
							if (companyKeys.includes(key)) {
								if (value === null) {
									value = "None"
								}
								dataInfo.push({
									id: id,
									label: key,
									data: typeof value == "number" ? value.toFixed(2) : value,
								})
								id++
							}
						}
						for (let [key, value] of Object.entries(info) as [string, string | number][]) {
							if (key !== "id") {
								if (value === null) {
									value = "None"
								} else if (key.includes("Price")) {
									value = `$${Number.parseFloat(value as string).toFixed(2)}`
								} else if (key === "dividendRate") {
									key = "Annual Dividend"
									value = `$${parseFloat(value as string).toFixed(2)}`
								}
								dataInfo.push({
									id: id,
									label: key,
									data: value as string,
								})
								id++
							}
						}
					}
				} catch (error) {
					console.log(error)
				}
				break
			}
			case StockInfoData.NEWS: {
				// company news
				try {
					const response = await djangoApi.get(`/stocks/articles/${companyData.id}`)
					if (response.status === 200) {
						setCompanyInfoData(response.data)
					}
				} catch (error) {
					console.log(error)
				}
				break
			}
			case StockInfoData.FINANCIAL: {
				// company financial reports
				try {
					const response = await djangoApi.get(`/stocks/reports/${companyData.id}`)
					if (response.status === 200) {
						dataInfo = response.data.map((report: any) => {
							const obj: CompanyFinancialData = {
								id: report.id,
								netIncome: report.net_income,
								operatingIncome: report.operating_income,
								totalRevenue: report.total_revenue,
								timestamp: report.timestamp,
							}
							return obj
						})
					}
				} catch (err) {
					console.log(err)
				}
				break
			}
			case StockInfoData.TECHNICAL: {
				break
			}
			default: {
			}
		}
		if (dataInfo.length > 0) {
			setCompanyInfoData((prev) => {
				return {
					...prev,
					[companySelectedFilter.toLowerCase()]: dataInfo,
				}
			})
		}
	}

	const handleSellStock = () => {}

	const handleBuyStock = () => {}

	const toggleItemWatchlist = () => {}

	return (
		<>
			<SafeAreaView style={styles.screenContainer}>
				<View style={styles.topContainer}>
					<Pressable
						style={[styles.topPressableBtn, { backgroundColor: "#133E87" }]}
						onPress={() => navigation.goBack()}
					>
						<Ionicons name="arrow-back-outline" size={26} color="white" />
					</Pressable>
					<Text style={styles.topContainerTxt}>Detail</Text>
					<Pressable style={[styles.topPressableBtn, { backgroundColor: "#4375F5" }]} onPress={toggleItemWatchlist}>
						<Ionicons name="star-outline" size={26} color="whitesmoke" />
					</Pressable>
				</View>
			</SafeAreaView>
			<ScrollView
				showsVerticalScrollIndicator={false}
				contentContainerStyle={{ flexGrow: 1, paddingBottom: 80 }}
				alwaysBounceVertical={false}
				style={{ flex: 1 }}
			>
				<View style={styles.stockOverviewContainer}>
					<View style={styles.stockOverviewLeftContainer}>
						<StockCompanyLogo url={companyData.logo} />
						<View style={{ gap: 3 }}>
							<Text style={styles.stockTickerTxt}>{companyData.ticker}</Text>
							<Text style={styles.stockTitleTxt}>{companyData.name}</Text>
						</View>
					</View>
					<View style={styles.stockOverviewRightContainer}>
						<Text style={styles.stockPrice}>{`$${stockData.currentPrice.toFixed(2)}`}</Text>
						<View style={{ flexDirection: "row", alignItems: "center" }}>
							<Ionicons
								name={isPriceDown ? "caret-down-outline" : "caret-up-outline"}
								size={20}
								color={isPriceDown ? "#E34646" : "#2DCE5A"}
							/>
							<Text
								style={{
									color: isPriceDown ? "#E34646" : "#2DCE5A",
									fontFamily: "roboto-medium",
								}}
							>{`$${stockData.stockPriceChange.toFixed(2)}(${stockData.stockPercentChange.toFixed(2)}%)`}</Text>
						</View>
					</View>
				</View>
				<View style={styles.btnStockContainer}>
					<ButtonRowContainer interval={stockPriceInterval} onSelectInterval={setStockPriceInterval} />
				</View>
				<View style={styles.chartContainer}>
					{chartPriceData.length !== 0 && (
						<LineChart
							data={chartPriceData}
							xKey="timestamp"
							yKeys={["stockPrice"]}
							chartConfig={{
								domainPadding: { top: 25, right: 5 },
								axisOptions: {
									labelColor: "whitesmoke",
									lineColor: "gray",
								},
								formatXLabel: (xLabel: string, index: number) => {
									const date = new Date(xLabel)
									return format(date, "MMM y")
								},
							}}
							lineConfig={{
								color: isPriceDown ? "#F28B82" : "lightgreen",
							}}
							chartHeight={330}
							gradientColors={isPriceDown ? ["#e02f35", "#bf322f"] : ["green", "#90ee9050"]}
						/>
					)}
				</View>
				<View style={styles.stockInfoContainer}>
					<FilterList
						filters={companyFilters}
						selectedFilter={companySelectedFilter}
						changeFilter={(filter: StockInfoData) => setCompanySelectedFilter(filter)}
					/>
					{companySelectedFilter === StockInfoData.OVERVIEW && (
						<FlatList
							style={styles.companyInfoContainer}
							data={companyInfoData["overview"]}
							renderItem={({ item, index }) => renderOverviewItem(item, index)}
							keyExtractor={(item) => item.id + ""}
							numColumns={2}
							scrollEnabled={false}
							horizontal={false}
							showsVerticalScrollIndicator={false}
						/>
					)}
					{companySelectedFilter === StockInfoData.FINANCIAL &&
						companyInfoData.financial.length > 0 &&
						(() => {
							const barChartData = companyInfoData.financial.map((financialData) => {
								return {
									timestamp: financialData.timestamp,
									netIncome: financialData.netIncome,
									operatingIncome: financialData.operatingIncome,
									totalRevenue: financialData.totalRevenue,
								}
							})
							return ["net Income", "total Revenue", "operating Income"].map((reportType, index) => {
								return (
									<View key={index} style={styles.financialStatisticsContainer}>
										<Text
											style={{
												color: "whitesmoke",
												fontSize: 20,
												marginBottom: 10,
												fontFamily: "roboto-medium",
											}}
										>
											{reportType.toUpperCase()[0] + reportType.slice(1)}
										</Text>
										<BarChart
											data={barChartData}
											xKey="timestamp"
											yKeys={[reportType.replace(" ", "")]}
											chartConfig={{
												formatXLabel: (xLabel: string, index: number) => {
													const date = new Date(xLabel)
													return format(date, "MMM y")
												},
											}}
											gradientColors={["#4dc9e6", "#210cae"]}
										/>
									</View>
								)
							})
						})()}
				</View>
			</ScrollView>
			<OptionsBottomSheet companyId={companyData.id} companyTicker={companyData.ticker} />
		</>
	)
}

export default StockScreen
const styles = StyleSheet.create({
	screenContainer: {
		paddingHorizontal: 6,
	},
	topContainer: {
		marginTop: 8,
		width: "100%",
		paddingHorizontal: 14,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
	},
	topContainerTxt: {
		fontSize: 24,
		color: "whitesmoke",
		fontFamily: "roboto-bold",
	},
	topPressableBtn: {
		padding: 4,
		borderRadius: 6,
		shadowColor: "#024CAA",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.3,
		shadowRadius: 4,
		elevation: 4,
	},
	stockOverviewContainer: {
		marginTop: 16,
		marginBottom: 20,
		paddingHorizontal: 6,
		width: "100%",
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
	},
	stockOverviewLeftContainer: {
		flexDirection: "row",
		gap: 8,
		alignItems: "center",
	},
	stockImageLogo: {
		height: 60,
		width: 60,
		borderRadius: 30,
		paddingHorizontal: 6,
		backgroundColor: "black",
	},
	stockTickerTxt: {
		fontSize: 22,
		fontFamily: "roboto-medium",
		color: "whitesmoke",
	},
	stockTitleTxt: {
		fontSize: 18,
		fontFamily: "inter-light",
		color: "#EEEEEE",
	},
	stockOverviewRightContainer: {
		alignItems: "center",
		gap: 2,
	},
	stockPrice: {
		fontFamily: "roboto-bold",
		fontSize: 24,
		color: "whitesmoke",
	},
	chartContainer: {
		marginTop: 12,
		paddingHorizontal: 10,
	},
	stockInfoContainer: {
		marginTop: 18,
		paddingHorizontal: 6,
	},
	btnStockContainer: {
		paddingHorizontal: 6,
	},
	companyInfoContainer: {
		marginTop: 16,
		paddingVertical: 6,
		paddingHorizontal: 12,
		borderRadius: 4,
		backgroundColor: "#1E201E",
		shadowColor: "whitesmoke",
		shadowOffset: { width: 2, height: 2 },
		shadowOpacity: 0.5,
		shadowRadius: 3,
	},
	dataInfoItem: {
		flex: 1,
		marginVertical: 8,
		gap: 2,
	},
	financialStatisticsContainer: {
		marginTop: 20,
		paddingHorizontal: 6,
	},
})
