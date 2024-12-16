import { SafeAreaView, StyleSheet, Text, View } from "react-native"
import { useWatchList } from "../store/context/WatchListContext"

function FollowedListScreen() {
	const { watchlistState } = useWatchList()
	console.log("Hej tutaj " + watchlistState?.tickers)

	return (
		<SafeAreaView style={{ paddingHorizontal: 10 }}>
			<Text style={styles.title}>My watchlist</Text>
		</SafeAreaView>
	)
}

export default FollowedListScreen
const styles = StyleSheet.create({
	title: {
		fontFamily: "roboto-medium",
		fontSize: 26,
		color: "whitesmoke",
	},
})
