import { Text, View, Pressable, StyleSheet } from "react-native"
import { StockInfoData } from "../types/app-types"

type FilterListProps = {
	filters: any[]
	selectedFilter: StockInfoData
	changeFilter: (item: any) => void
}

export default function FilterList({ filters, selectedFilter, changeFilter }: FilterListProps) {
	return (
		<View style={styles.filterOptionContainer}>
			{filters.map((filter) => (
				<Pressable
					key={filter}
					style={[styles.filterOptionBtn, selectedFilter === filter && styles.filterOptionBtnSelected]}
					onPress={() => changeFilter(filter)}
				>
					<Text
						style={[styles.filterOptionBtnTxt, selectedFilter === filter ? { color: "whitesmoke" } : { color: "gray" }]}
					>
						{filter}
					</Text>
				</Pressable>
			))}
		</View>
	)
}

const styles = StyleSheet.create({
	filterOptionContainer: {
		flexDirection: "row",
		alignItems: "center",
	},
	filterOptionBtn: {
		flex: 1,
		paddingHorizontal: 12,
		paddingVertical: 14,
		backgroundColor: "#3C4454",
		borderRadius: 4,
		marginRight: 10,
	},
	filterOptionBtnTxt: {
		textAlign: "center",
		fontFamily: "roboto-medium",
	},
	filterOptionBtnSelected: {
		backgroundColor: "#4B79F4",
	},
})
