import { Text, StyleSheet, Pressable } from "react-native"
import BottomSheet, { BottomSheetBackdrop, BottomSheetView } from "@gorhom/bottom-sheet"
import React, { useCallback, useMemo, useRef, useState } from "react"
import { Ionicons } from "@expo/vector-icons"

type OptionsBottomSheetProps = {
	companyId: number
	companyTicker: string
}

const OptionsBottomSheet = ({ companyId, companyTicker }: OptionsBottomSheetProps) => {
	const [isSheetExpanded, setIsSheetExpanded] = useState(false)
	const sheetRef = useRef<BottomSheet>(null)
	const snapPoints = useMemo(() => ["20%", "35%", "50%", "75%", "90%"], [])

	const handleClosePress = useCallback(() => {
		sheetRef?.current?.close()
	}, [])

	const renderBackdrop = useCallback(
		(props: any) => <BottomSheetBackdrop opacity={0.4} appearsOnIndex={2} disappearsOnIndex={0} {...props} />,
		[]
	)
	const handleSheetChange = (index: number) => {
		setIsSheetExpanded(index > 0)
	}

	const handleBuyStock = () => {
		console.log("Buy stock")
	}

	const handleSellStock = () => {
		console.log("Sell stock")
	}

	const calculateCompanySentiment = () => {}

	return (
		<BottomSheet
			ref={sheetRef}
			index={0}
			snapPoints={snapPoints}
			enablePanDownToClose={true}
			backdropComponent={renderBackdrop}
			backgroundStyle={{ backgroundColor: "#2A3335" }}
			handleIndicatorStyle={{ backgroundColor: "#000000" }}
			onChange={handleSheetChange}
		>
			<BottomSheetView style={[styles.contentContainer, isSheetExpanded && styles.contentContainerCenter]}>
				<Pressable style={[styles.bottomActionBtn, { backgroundColor: "#0C41E1" }]} onPress={handleBuyStock}>
					<Text style={[styles.bottomActionBtnText, { color: "whitesmoke" }]}>Buy Now</Text>
				</Pressable>
				{/* <Pressable style={[styles.bottomActionBtn, { backgroundColor: "#0C41E1" }]} onPress={handleBuyStock}>
					<Text style={[styles.bottomActionBtnText, { color: "whitesmoke" }]}>Buy Now</Text>
				</Pressable> */}
				<Pressable
					style={[
						styles.bottomActionBtn,
						{
							backgroundColor: "#F29F58",
							flexDirection: "row",
							alignItems: "center",
							justifyContent: "center",
							gap: 2,
						},
					]}
					onPress={calculateCompanySentiment}
				>
					<Ionicons size={22} color={"#1B1833"} name="happy-outline" />
					<Text style={[styles.bottomActionBtnText, { color: "whitesmoke" }]}>Calculate Sentiment</Text>
				</Pressable>
			</BottomSheetView>
		</BottomSheet>
	)
}

export default OptionsBottomSheet

const styles = StyleSheet.create({
	container: {
		flex: 1,
		alignItems: "center",
	},
	contentContainer: {
		flex: 1,
		alignItems: "flex-start",
		paddingHorizontal: 30,
		gap: 10,
		paddingVertical: 5,
	},
	contentContainerCenter: {
		justifyContent: "center",
	},
	bottomActionBtn: {
		width: "100%",
		paddingVertical: 15,
		paddingHorizontal: 45,
		borderRadius: 10,
	},
	bottomActionBtnText: {
		fontSize: 22,
		fontWeight: 600,
		color: "black",
		textAlign: "center",
	},
	sheet: {
		position: "absolute",
		bottom: 0,
		left: 0,
		right: 0,
	},
})
