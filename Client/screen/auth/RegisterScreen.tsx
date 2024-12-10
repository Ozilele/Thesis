import { StyleSheet, View, Image, Platform } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import AuthForm from "../../components/AuthForm"
import { AuthFormMode } from "../../types/app-types"

const inputs = [
	{
		label: "Username",
		inputKey: "username",
		autoCorrectOption: false,
	},
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
	{
		label: "Confirm Password",
		inputKey: "confirm_password",
		autoCorrectOption: true,
	},
]
const tooltipData = {
	key: "Already Have an Account?",
	text: "Signin",
}

export default function RegisterScreen() {
	return (
		<LinearGradient colors={["#25272b", "#243642", "#20293f"]} style={styles.fullScreen}>
			<View style={styles.imageContainer}>
				<Image source={require("../../assets/app/stock_reg.jpg")} resizeMode="cover" style={styles.image} />
			</View>
			<AuthForm formMode={AuthFormMode.REGISTER} inputs={inputs} tooltipData={tooltipData} />
		</LinearGradient>
	)
}

const styles = StyleSheet.create({
	fullScreen: {
		flex: 1,
	},
	imageContainer: {
		height: "30%",
		elevation: 5,
		shadowColor: "black",
		shadowOpacity: 0.6,
		shadowOffset: { width: 2, height: 3 },
		shadowRadius: 4,
		overflow: Platform.OS == "android" ? "hidden" : "visible",
	},
	image: {
		width: "100%",
		height: "100%",
		borderBottomRightRadius: 40,
		opacity: 0.75,
	},
})
