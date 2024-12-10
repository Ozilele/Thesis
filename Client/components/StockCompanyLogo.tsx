import { View, StyleSheet, Image } from "react-native"
import { useEffect, useState } from "react"

function StockCompanyLogo({ url }: { url: string }) {
	const [logoURL, setLogoURL] = useState(
		url !== ""
			? url
			: "https://api-ninjas-data.s3.us-west-2.amazonaws.com/logos/lefd12553d6a4f7e57b3ac4f4927181d7a651d0d6.png"
	)
	const [imageAspectRatio, setImageAspectRatio] = useState(0.85)

	useEffect(() => {
		if (logoURL) {
			Image.getSize(
				logoURL,
				(width, height) => {
					if (height > width) {
						setImageAspectRatio(0.55)
					} else {
						setImageAspectRatio(0.85)
					}
				},
				(err) => {
					console.log(err)
				}
			)
		}
	}, [logoURL])

	return (
		<View style={styles.stockLogoContainer}>
			<Image
				source={{
					uri: logoURL,
				}}
				style={[styles.stockLogoImage, { aspectRatio: imageAspectRatio }]}
				resizeMode="contain"
			/>
		</View>
	)
}

export default StockCompanyLogo
const styles = StyleSheet.create({
	stockLogoContainer: {
		height: 60,
		width: 60,
		borderRadius: 30,
		paddingHorizontal: 6,
		backgroundColor: "white",
		overflow: "hidden",
		alignItems: "center",
		justifyContent: "center",
	},
	stockLogoImage: {
		width: "100%",
		height: "100%",
	},
})
