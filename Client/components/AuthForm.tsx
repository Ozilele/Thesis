import { Button, Pressable, StyleSheet, Text, TextInput, View, Alert, Platform } from "react-native"
import AntDesign from "@expo/vector-icons/AntDesign"
import { useEffect, useMemo, useState } from "react"
import * as WebBrowser from "expo-web-browser"
import * as Google from "expo-auth-session/providers/google"
import { IOS_CLIENT_ID, ANDROID_CLIENT_ID, WEB_CLIENT_ID } from "@env"
import { useNavigation, NavigationProp } from "@react-navigation/native"
import { AuthFormMode, AuthInputElement, AuthInputs, RootStackParamList } from "../types/app-types"
import { useAuth } from "../store/context/AuthContext"
import djangoApi, { authResponseInterceptor, setupAPIResponseInterceptor } from "../api/djangoApi"

type AuthFormProps = {
	formMode: AuthFormMode
	inputs: AuthInputElement[]
	tooltipData: {
		key: string
		text: string
	}
}

WebBrowser.maybeCompleteAuthSession()

export default function AuthForm({ formMode, inputs, tooltipData }: AuthFormProps) {
	const clearedInputs = useMemo(() => {
		const obj: Partial<AuthInputs> = {}
		inputs.forEach((input) => {
			const key = input.inputKey as keyof AuthInputs
			obj[key] = ""
		})
		return obj as AuthInputs
	}, [inputs])
	const [authInputs, setAuthInputs] = useState<AuthInputs>(clearedInputs)
	const { onLogin, onRegister } = useAuth()
	const navigation = useNavigation<NavigationProp<RootStackParamList>>()

	const googleConfig = {
		androidClientId: ANDROID_CLIENT_ID,
		iosClientId: IOS_CLIENT_ID,
		webClientId: WEB_CLIENT_ID,
	}
	// promptAsync - When invoked, a web browser will open up and prompt the user for authentication. Accepts an AuthRequestPromptOptions object with options about how the prompt will execute.
	const [request, response, promptAsync] = Google.useAuthRequest(googleConfig)

	useEffect(() => {
		if (response != null) {
			// promptAsync has been invoked and returned sth
			handleGoogleSignIn()
		}
	}, [response])

	const handleForgetPassword = () => {}

	const handleSignIn = async () => {
		if (authResponseInterceptor != null) {
			djangoApi.interceptors.response.eject(authResponseInterceptor)
		}
		const result = await onLogin!(authInputs["email"], authInputs["password"])
		if (result && result.error) {
			Alert.alert(result.msg)
		} else {
			// no error
			setupAPIResponseInterceptor()
			navigation.navigate("App")
		}
	}

	const handleGoogleSignIn = async () => {
		if (authResponseInterceptor != null) {
			djangoApi.interceptors.response.eject(authResponseInterceptor)
		}
		if (response?.type === "success") {
			const { authentication } = response
			const idToken = authentication?.idToken
			try {
				const backend_response = await djangoApi.post(`/auth/google/`, {
					token: idToken,
					aud: Platform.OS === "android" ? googleConfig.androidClientId : googleConfig.iosClientId,
				})
				console.log(backend_response)
				if (backend_response.status === 200) {
					setupAPIResponseInterceptor()
					navigation.navigate("App")
				}
			} catch (err) {
				console.log(err)
				Alert.alert("Google Sign Failed to complete(Received token is invalid)")
			}
		} else {
			Alert.alert("Google Sign Failed to complete.")
		}
	}

	const handleSignUp = async () => {
		if (authResponseInterceptor != null) {
			djangoApi.interceptors.response.eject(authResponseInterceptor)
		}
		const username = authInputs["username"] as string
		const response = await onRegister!(username, authInputs["email"], authInputs["password"])
		if (response && response.error) {
			Alert.alert(response.msg)
		} else if (response.status === 201) {
			navigation.navigate("Login")
		}
	}

	const onBtnNavigateTo = () => {
		setAuthInputs(clearedInputs)
		formMode === AuthFormMode.LOGIN ? navigation.navigate("Register") : navigation.navigate("Login")
	}

	const handleInputChange = (key: string, value: string) => {
		setAuthInputs((prev) => {
			return {
				...prev,
				[key]: value,
			}
		})
	}

	return (
		<View style={styles.formContainer}>
			<Text style={styles.title}>{formMode}</Text>
			{inputs.map((input) => {
				const isEmailAddress = input.label === "Email"
				const inputKey = input.inputKey
				return (
					<View key={input.label} style={styles.inputContainer}>
						<Text style={styles.labelText}>{input.label}</Text>
						<TextInput
							style={styles.input}
							value={authInputs[inputKey]}
							onChangeText={(text) => handleInputChange(inputKey, text)}
							keyboardType={isEmailAddress ? "email-address" : "default"}
							autoCorrect={input.autoCorrectOption}
							autoCapitalize="none"
							clearButtonMode="while-editing"
							secureTextEntry={inputKey.includes("password") ? true : false}
						/>
					</View>
				)
			})}
			{formMode === "Login" && (
				<View
					style={{
						width: "100%",
						flexDirection: "row",
						justifyContent: "flex-end",
						marginTop: 6,
					}}
				>
					<Pressable onPress={handleForgetPassword}>
						<Text style={{ color: "white", fontSize: 15 }}>Forget Password?</Text>
					</Pressable>
				</View>
			)}
			{formMode === "Login" && (
				<View style={styles.btnsContainer}>
					<View style={[styles.btnContainer, { backgroundColor: "#615EFC" }]}>
						<Button title="Sign in" color="white" onPress={handleSignIn} />
					</View>
					<Text style={styles.orTxt}>or</Text>
					<View style={[styles.btnContainer, { backgroundColor: "#7AB2B2" }]}>
						<AntDesign name="google" size={24} color="#5C2FC2" />
						<Button title="Login with Google" color="white" onPress={() => promptAsync()} />
					</View>
				</View>
			)}
			{formMode === "Register" && (
				<View style={styles.btnsContainer}>
					<View style={[styles.btnContainer, { backgroundColor: "#615EFC", marginTop: 16 }]}>
						<Button title="Sign up" color="white" onPress={handleSignUp} />
					</View>
				</View>
			)}
			<View style={[styles.btnsContainer, styles.infoContainer]}>
				<Text style={{ color: "white" }}>{tooltipData.key}</Text>
				<Pressable android_ripple={{ color: "#ccc" }} onPress={onBtnNavigateTo}>
					<Text style={styles.signUpTxt}>{tooltipData.text}</Text>
				</Pressable>
			</View>
		</View>
	)
}

const styles = StyleSheet.create({
	formContainer: {
		flexGrow: 1,
		marginTop: 10,
		paddingHorizontal: 22,
		paddingVertical: 10,
	},
	title: {
		color: "whitesmoke",
		fontSize: 32,
		fontWeight: "bold",
	},
	inputContainer: {
		marginTop: 12,
	},
	labelText: {
		color: "white",
		marginBottom: 6,
		fontSize: 16,
	},
	input: {
		padding: 10,
		fontSize: 18,
		height: 52,
		borderColor: "#F5F7F8",
		backgroundColor: "#021526",
		color: "white",
		borderWidth: 2,
		borderRadius: 6,
	},
	btnsContainer: {
		width: "90%",
		marginHorizontal: "auto",
		marginTop: 12,
	},
	btnContainer: {
		padding: 4,
		borderRadius: 8,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
	},
	orTxt: {
		color: "white",
		textAlign: "center",
		marginTop: 6,
		marginBottom: 6,
		fontSize: 16,
	},
	infoContainer: {
		flex: 1,
		alignItems: "center",
		justifyContent: "flex-end",
		marginBottom: 10,
	},
	signUpTxt: {
		color: "#615EFC",
		fontSize: 16,
		fontWeight: "bold",
	},
})
