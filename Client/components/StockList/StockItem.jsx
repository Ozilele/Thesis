import { useLayoutEffect } from "react"
import { StyleSheet, Text, View } from "react-native"

export default function StockItem({ route, navigation }) {
	// const stockTitle = route.params.stockTitle

	// useLayoutEffect(() => {
	// 	navigation.setOptions({
	// 		title: stockTitle,
	// 	})
	// }, [navigation, stockTitle])

	return (
		<View>
			<Text>StockItem</Text>
		</View>
	)
}

const styles = StyleSheet.create({})
