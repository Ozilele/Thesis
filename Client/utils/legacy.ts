// useEffect(() => {
//   // to do -> cache -> przechowywanie danych w cachu a nie ciagle calle do api, cache danych rzadziej querowanych np. dla 5Y dluzej trzymany, do ogarnięcia stock split np. w przypadku Nvidii
//   let API_URL = ""
//   let RESPONSE_KEY = ""
//   let lastQueriedDay = null
//   const API_KEY = process.env.EXPO_PUBLIC_STOCK_DATA_API_KEY
//   switch (selectedInterval) {
//     case "1D": {
//       API_URL = `https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=${companyData.ticker}&interval=5min&apikey=${API_KEY}`
//       RESPONSE_KEY = "Time Series (5min)"
//       break
//     }
//     case "7D": {
//       API_URL = `https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=${companyData.ticker}&interval=60min&apikey=${API_KEY}`
//       RESPONSE_KEY = "Time Series (60min)"
//       break
//     }
//     case "1M": {
//       // jest ok
//       // lastQueriedDay = getPastMonthDate(1)
//       API_URL = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${companyData.ticker}&apikey=${API_KEY}`
//       RESPONSE_KEY = "Time Series (Daily)"
//       break
//     }
//     case "3M": {
//       // jest ok
//       // lastQueriedDay = getPastMonthDate(3)
//       API_URL = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${companyData.ticker}&apikey=${API_KEY}`
//       RESPONSE_KEY = "Time Series (Daily)"
//       break
//     }
//     case "6M": {
//       // do zmiany
//       // lastQueriedDay = getPastMonthDate(6)
//       API_URL = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${companyData.ticker}&apikey=${API_KEY}`
//       RESPONSE_KEY = "Time Series (Daily)"
//       break
//     }
//     case "YTD": {
//       // jest sprawdzone
//       lastQueriedDay = "2024-01-01"
//       API_URL = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${companyData.ticker}&outputsize=full&apikey=${API_KEY}`
//       RESPONSE_KEY = "Time Series (Daily)"
//       break
//     }
//     case "1Y": {
//       // lastQueriedDay = getLastPossibleYearDate(1)
//       // API_URL = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${stockTicker}&outputsize=full&apikey=${API_KEY}`
//       // API_URL = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=IBM&outputsize=full&apikey=${API_KEY}`
//       API_URL = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=AMZN&outputsize=full&apikey=${API_KEY}`
//       RESPONSE_KEY = "Time Series (Daily)"
//       break
//     }
//     case "5Y": {
//       // lastQueriedDay = getLastPossibleYearDate(5)
//       API_URL = `https://www.alphavantage.co/query?function=TIME_SERIES_WEEKLY&symbol=${companyData.ticker}&apikey=${API_KEY}`
//       RESPONSE_KEY = "Weekly Time Series"
//       break
//     }
//     case "MAX": {
//       API_URL = `https://www.alphavantage.co/query?function=TIME_SERIES_MONTHLY&symbol=${companyData.ticker}&apikey=${API_KEY}`
//       RESPONSE_KEY = "Monthly Time Series"
//       break
//     }
//   }
//   // makeStockPriceApiCall(API_URL, RESPONSE_KEY, lastQueriedDay)
//   // 	.then((res: StockPriceData[] | null) => {
//   // 		console.log("Response ", res)
//   // 		if (res != null) {
//   // 			setChartPriceData(res)
//   // 		}
//   // 	})
//   // 	.catch((err) => {
//   // 		console.log(err)
//   // 	})
// }, [selectedInterval])
