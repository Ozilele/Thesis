// import "react-native-reanimated"
import "react-native-gesture-handler"
import { StatusBar } from "expo-status-bar"
import { NavigationContainer } from "@react-navigation/native"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import StockScreen from "./screen/StockScreen"
import TabNavigator from "./components/Navigation/TabNavigator"
import { useFonts } from "expo-font"
import LoginScreen from "./screen/auth/LoginScreen"
import RegisterScreen from "./screen/auth/RegisterScreen"
import AuthProvider, { useAuth } from "./store/context/AuthContext"
import WatchListProvider from "./store/context/WatchListContext"
import { RootStackParamList } from "./types/app-types"
import { GestureHandlerRootView } from "react-native-gesture-handler"

const Stack = createNativeStackNavigator<RootStackParamList>()

export default function App() {
	const [fontsLoaded] = useFonts({
		"inter-light": require("./assets/fonts/Inter24Light.ttf"),
		"roboto-medium": require("./assets/fonts/Roboto-Medium.ttf"),
		"roboto-bold": require("./assets/fonts/Roboto-Bold.ttf"),
	})
	// if (!fontsLoaded) {
	// 	return <AppLoading />
	// }
	return (
		<>
			<StatusBar style="light" />
			<AuthProvider>
				<Layout />
			</AuthProvider>
		</>
	)
}

export const Layout = () => {
	const { authState } = useAuth()

	return (
		<GestureHandlerRootView style={{ flex: 1 }}>
			<WatchListProvider>
				<NavigationContainer>
					<Stack.Navigator
						screenOptions={{
							contentStyle: { backgroundColor: "#1A1A19" },
							headerTintColor: "whitesmoke",
							headerStyle: { backgroundColor: "#133E87" },
						}}
					>
						{authState?.authenticated ? (
							<>
								<Stack.Screen
									name="App"
									component={TabNavigator}
									options={{
										headerShown: false,
									}}
								/>
								<Stack.Screen
									name="StockItemScreen"
									component={StockScreen}
									options={{
										headerShown: false,
									}}
								/>
							</>
						) : (
							<>
								<Stack.Screen
									name="Login"
									component={LoginScreen}
									options={{
										headerShown: false,
									}}
								/>
								<Stack.Screen
									name="Register"
									component={RegisterScreen}
									options={{
										headerShown: false,
									}}
								/>
							</>
						)}
					</Stack.Navigator>
				</NavigationContainer>
			</WatchListProvider>
		</GestureHandlerRootView>
	)
}
