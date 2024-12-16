import { StyleSheet, View, Text } from "react-native"
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import MarketScreen from "../../screen/MarketScreen"
import DrawerNavigator from "../../components/Navigation/DrawerNavigator"
import PortfolioScreen from "../../screen/PortfolioScreen"
import FollowedListScreen from "../../screen/FollowedListScreen"
import { Ionicons } from "@expo/vector-icons"
import { useState } from "react"
import { useSafeAreaInsets } from "react-native-safe-area-context"

const BottomTab = createBottomTabNavigator()

function TabNavigator() {
	const [isBottomBarVisible, setBottomBarVisible] = useState<boolean>(true)
	const insets = useSafeAreaInsets()

	const handleBottomBarToggle = () => {
		setBottomBarVisible((prev) => !prev)
	}

	return (
		<BottomTab.Navigator
			backBehavior="history"
			initialRouteName="Home"
			sceneContainerStyle={{
				backgroundColor: "#1E263C",
			}}
			screenOptions={({ route }) => ({
				tabBarIcon: ({ focused, color, size }) => {
					let iconName = ""
					switch (route.name) {
						case "Home":
							iconName = focused ? "home" : "home-outline"
							break
						case "Portfolio":
							iconName = focused ? "pie-chart" : "pie-chart-outline"
							break
						case "Market":
							iconName = focused ? "trending-up" : "trending-up-outline"
							break
						case "FollowedList":
							iconName = focused ? "list" : "list-outline"
							break
					}
					return <Ionicons name={iconName} size={size} color={color} />
				},
				tabBarStyle: isBottomBarVisible
					? {
							...styles.tabBarStyle,
							marginBottom: insets.bottom,
							// marginLeft: insets.left,
							// marginRight: insets.right,
						}
					: { display: "none" },
				tabBarItemStyle: {
					...styles.tabBarItemStyle,
				},
				tabBarLabel: ({ focused, color, children }) => {
					return (
						<View>
							<Text
								style={{
									fontSize: 10,
									color,
									fontWeight: focused ? "bold" : "normal",
								}}
							>
								{children}
							</Text>
						</View>
					)
				},
				tabBarInactiveTintColor: "#A3A9BA",
				tabBarActiveBackgroundColor: "#5482f6",
				tabBarActiveTintColor: "#ffff",
				headerShown: false,
			})}
		>
			<BottomTab.Screen name="Home" options={{ headerShown: false }}>
				{() => <DrawerNavigator onBottomBarToggle={handleBottomBarToggle} />}
			</BottomTab.Screen>
			<BottomTab.Screen name="Market" component={MarketScreen} options={{}} />
			<BottomTab.Screen name="Portfolio" component={PortfolioScreen} options={{}} />
			<BottomTab.Screen name="FollowedList" component={FollowedListScreen} options={{}} />
		</BottomTab.Navigator>
	)
}

export default TabNavigator

const styles = StyleSheet.create({
	tabBarStyle: {
		position: "absolute",
		bottom: -10,
		left: 10,
		right: 10,
		height: 80,
		backgroundColor: "#273148",
		borderRadius: 30,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.6,
		shadowRadius: 5,
		elevation: 5,
		justifyContent: "center",
		alignItems: "center",
	},
	tabBarItemStyle: {
		borderRadius: 25,
		height: 80,
		paddingVertical: 20,
	},
})
