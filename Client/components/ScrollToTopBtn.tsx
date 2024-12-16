import React from "react"
import { Pressable } from "react-native"
import { Ionicons } from "@expo/vector-icons"

type ScrollToTopBtnProps = {
	handleOnTopScroll: () => void
}

const ScrollToTopBtn = ({ handleOnTopScroll }: ScrollToTopBtnProps) => {
	const onTop = () => {
		handleOnTopScroll()
	}
	return (
		<Pressable
			style={{
				borderRadius: 11,
				paddingHorizontal: 12,
				paddingVertical: 12,
				position: "absolute",
				bottom: 100,
				right: 10,
				backgroundColor: "#001A6E",
			}}
			onPress={onTop}
		>
			<Ionicons name="arrow-up-circle-outline" size={26} color="#F8FAFC" />
		</Pressable>
	)
}

export default ScrollToTopBtn
