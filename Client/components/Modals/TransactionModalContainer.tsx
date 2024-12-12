import {
	View,
	Text,
	Pressable,
	StyleSheet,
	TextInput,
	KeyboardAvoidingView,
	TouchableWithoutFeedback,
	Platform,
	Keyboard,
} from "react-native"
import React, { useEffect, useState } from "react"
import { Ionicons } from "@expo/vector-icons"

type TransactionModalContainerProps = {
	data: {
		companyName: string
		companyTicker: string
		currPrice: number
	}
	setModalVisibility: React.Dispatch<React.SetStateAction<boolean>>
}

const TransactionModalContainer = ({ data, setModalVisibility }: TransactionModalContainerProps) => {
	const [transactionData, setTransactionData] = useState<{ amount: string; shares: string }>({
		amount: "$",
		shares: "",
	})
	const [availableFunds, setAvailableFunds] = useState<number>(421.23)
	const onBack = () => {
		setModalVisibility(false)
	}

	useEffect(() => {
		// get current available deposit
	}, [])

	const onInputChange = (text: string, type: string) => {
		let formattedValue
		if (type === "Amount") {
			formattedValue = text.replace(/[^$0-9.]+|(\..*)\./g, "")
			if (formattedValue === "$" || formattedValue === "") {
				setTransactionData({ amount: "$", shares: "" })
			} else {
				let amountNumber = parseFloat(formattedValue.replace("$", ""))
				const obj = {
					amount: formattedValue || "$",
					shares: (amountNumber / data.currPrice).toFixed(3),
				}
				setTransactionData(obj)
			}
		} else {
			formattedValue = text.replace(/[^0-9.]+|(\..*)\./g, "")
			if (formattedValue === "") {
				setTransactionData({ amount: "$", shares: formattedValue })
			} else {
				const sharesNumber = parseFloat(formattedValue)
				const obj = {
					amount: "$" + (sharesNumber * data.currPrice).toFixed(3),
					shares: formattedValue,
				}
				setTransactionData(obj)
			}
		}
	}

	return (
		<KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.screen}>
			<TouchableWithoutFeedback onPress={Keyboard.dismiss}>
				<View style={{ paddingTop: 15, paddingHorizontal: 10, flex: 1 }}>
					<Pressable style={styles.backBtn} onPress={onBack}>
						<Ionicons name="arrow-back-outline" size={24} color="whitesmoke" />
					</Pressable>
					<View style={{ flex: 1, justifyContent: "space-evenly" }}>
						<View
							style={{
								flexDirection: "row",
								alignItems: "center",
								justifyContent: "space-between",
								paddingHorizontal: 8,
							}}
						>
							<View style={{ gap: 6 }}>
								<Text style={{ fontFamily: "roboto-bold", fontSize: 24, color: "#FBFBFB" }}>{data.companyTicker}</Text>
								<Text style={{ fontFamily: "inter-light", fontSize: 20, color: "#FBFBFB" }}>{data.companyName}</Text>
							</View>
							<Text style={{ fontSize: 28, fontFamily: "roboto-bold", color: "#F1F0E8" }}>{`$${data.currPrice}`}</Text>
						</View>
						<View style={styles.modalInputContainer}>
							{["Amount", "Shares"].map((label, index) => {
								return (
									<View key={index} style={[styles.inputContainerBox, label === "Amount" && styles.inputBorder]}>
										<TextInput
											autoCorrect={false}
											style={styles.inputField}
											clearButtonMode="while-editing"
											value={transactionData[label.toLowerCase()]}
											keyboardType="decimal-pad"
											onChangeText={(text) => {
												onInputChange(text, label)
											}}
										/>
										<View style={styles.inputLabel}>
											<Text style={styles.inputLabelText}>{label}</Text>
										</View>
									</View>
								)
							})}
						</View>
						<View style={{ flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 8 }}>
							<Text style={styles.modalText}>TOTAL</Text>
							<Text style={styles.modalText}>{`$${availableFunds} available`}</Text>
						</View>
						<View style={{ paddingHorizontal: 25 }}>
							<Pressable style={styles.buyBtn}>
								<Text
									style={{
										color: "whitesmoke",
										fontFamily: "roboto-bold",
										fontWeight: 600,
										textAlign: "center",
										fontSize: 20,
									}}
								>
									BUY
								</Text>
							</Pressable>
						</View>
					</View>
				</View>
			</TouchableWithoutFeedback>
		</KeyboardAvoidingView>
	)
}

export default TransactionModalContainer

const styles = StyleSheet.create({
	screen: {
		flex: 1,
		backgroundColor: "#2A3335",
	},
	backBtn: {
		marginTop: 10,
		width: 50,
		height: 50,
		backgroundColor: "#22177A",
		justifyContent: "center",
		alignItems: "center",
		borderRadius: 8,
	},
	modalInputContainer: {
		// marginTop: 60,
		paddingHorizontal: 8,
		gap: 45,
	},
	inputBorder: {
		borderBottomWidth: 2,
		borderBottomColor: "#F1F0E8",
	},
	inputContainerBox: {
		flexDirection: "row",
		alignItems: "center",
		paddingBottom: 16,
	},
	inputField: {
		flex: 1,
		fontSize: 32,
		fontFamily: "roboto-medium",
		fontWeight: 600,
		color: "whitesmoke",
	},
	inputLabel: {
		backgroundColor: "gray",
		padding: 8,
		borderRadius: 8,
	},
	inputLabelText: {
		fontSize: 17,
		color: "whitesmoke",
	},
	modalText: {
		fontSize: 18,
		color: "whitesmoke",
		fontFamily: "roboto-medium",
	},
	buyBtn: {
		width: "100%",
		paddingVertical: 18,
		backgroundColor: "#2bb466",
		borderRadius: 10,
	},
})
