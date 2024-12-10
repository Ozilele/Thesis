import { DrawerContentScrollView, DrawerItem, DrawerItemList } from "@react-navigation/drawer"
import { Image, Pressable, StyleSheet, Text, View } from "react-native"
import { useAuth } from "../../store/context/AuthContext"
import { useNavigation } from "@react-navigation/native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"

function CustomDrawerContent(props: any) {
	const { onLogout } = useAuth()
	const navigation = useNavigation()
	const { top, bottom } = useSafeAreaInsets()

	const logout = async () => {
		if (onLogout) {
			await onLogout()
			navigation.navigate("Login")
		}
	}

	return (
		<View style={{ flex: 1 }}>
			<DrawerContentScrollView {...props} scrollEnabled={false} contentContainerStyle={{ paddingTop: top }}>
				<View style={styles.imageProfileContainer}>
					<Image source={require("../../assets/app/profile.jpg")} style={styles.profileImg} />
					<Text style={{ fontWeight: "500", fontSize: 20, paddingTop: 8, color: "#E4E0E1" }}>Marioxd</Text>
				</View>
				<DrawerItemList {...props} />
				<View style={styles.logoutBtnContainer}>
					<DrawerItem
						label={() => (
							<Pressable style={styles.logoutBtn} onPress={logout}>
								<Ionicons name="log-out-outline" size={24} color="whitesmoke" />
								<Text style={{ color: "whitesmoke", fontSize: 18 }}>Logout</Text>
							</Pressable>
						)}
						onPress={() => logout()}
					/>
				</View>
			</DrawerContentScrollView>
			<View
				style={{
					flexDirection: "row",
					justifyContent: "center",
					alignItems: "center",
					gap: 2,
					borderTopColor: "#dde3fe",
					borderTopWidth: 1,
					padding: 20,
					paddingBottom: 15 + bottom,
				}}
			>
				<Ionicons color="white" name="logo-github" size={24} />
				<Text style={styles.footerLogoTxt}>Ozilele</Text>
			</View>
		</View>
	)
}

export default CustomDrawerContent
const styles = StyleSheet.create({
	logoutBtnContainer: {
		flex: 1,
		marginTop: 24,
	},
	logoutBtn: {
		flex: 1,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		gap: 4,
		paddingHorizontal: 6,
		paddingVertical: 12,
		borderRadius: 6,
		backgroundColor: "#8B5DFF",
	},
	footerLogoTxt: {
		fontSize: 22,
		color: "whitesmoke",
	},
	imageProfileContainer: {
		width: "100%",
		justifyContent: "center",
		alignItems: "center",
		marginBottom: 8,
		padding: 12,
	},
	profileImg: {
		alignSelf: "center",
		width: 80,
		height: 80,
		borderRadius: 40,
	},
})
