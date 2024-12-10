import { View, StyleSheet, Image } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import AuthForm from "../../components/AuthForm"
import { AuthFormMode } from "../../types/app-types"

const inputs = [
	{
		label: "Email",
		inputKey: "email",
		autoCorrectOption: false,
	},
	{
		label: "Password",
		inputKey: "password",
		autoCorrectOption: true,
	},
]

const tooltipData = {
	key: "Don't Have an Account?",
	text: "Signup",
}

export default function LoginScreen() {
	return (
		<LinearGradient colors={["#25272b", "#243642", "#20293f"]} style={styles.fullScreen}>
			<View style={styles.imageContainer}>
				<Image source={require("../../assets/app/stock_ai.jpg")} resizeMode="cover" style={styles.image} />
			</View>
			<AuthForm formMode={AuthFormMode.LOGIN} inputs={inputs} tooltipData={tooltipData} />
		</LinearGradient>
	)
}

const styles = StyleSheet.create({
	fullScreen: {
		flex: 1,
	},
	imageContainer: {
		height: "40%",
	},
	image: {
		width: "100%",
		height: "100%",
		borderBottomLeftRadius: 50,
		overflow: "hidden",
		opacity: 0.85,
	},
})
