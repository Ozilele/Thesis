import { createDrawerNavigator } from "@react-navigation/drawer"
import { Text, View } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import CustomDrawerContent from "./CustomDrawerContent"
import HomeScreen from "../../screen/HomeScreen"
import { NavigationProp, useNavigation } from "@react-navigation/native"
import SettingsScreen from "../../screen/SettingsScreen"
import TransactionsScreen from "../../screen/TransactionsScreen"
import { RootStackParamList } from "../../types/app-types"

const Drawer = createDrawerNavigator()

const ProfileScreen = () => {
	return (
		<View style={{ flex: 1 }}>
			<Text>Profile</Text>
		</View>
	)
}

function DrawerNavigator({ onBottomBarToggle }: { onBottomBarToggle: () => void }) {
	const navigation = useNavigation<NavigationProp<RootStackParamList, "Home">>()

	return (
		<Drawer.Navigator
			drawerContent={CustomDrawerContent}
			screenOptions={{
				headerShown: false,
				drawerType: "front",
				// headerStyle: { backgroundColor: "#351401" },
				// headerTintColor: "red", -> header options
				drawerHideStatusBarOnOpen: true,
				drawerStyle: {
					backgroundColor: "#273148",
					width: 240,
				},
				drawerInactiveTintColor: "white",
				drawerActiveTintColor: "whitesmoke",
				drawerActiveBackgroundColor: "#5482f6",
				sceneContainerStyle: { backgroundColor: "#1E263C" },
				drawerStatusBarAnimation: "slide",
				drawerLabelStyle: { marginLeft: -20 },
			}}
		>
			<Drawer.Screen
				name="index"
				options={{
					drawerLabel: "Home",
					headerTitle: "Home",
					drawerIcon: ({ color, size }) => <Ionicons name="home-outline" color={color} size={size} />,
				}}
			>
				{() => <HomeScreen navigation={navigation} onBottomBarToggle={onBottomBarToggle} />}
			</Drawer.Screen>
			<Drawer.Screen
				name="profile"
				component={ProfileScreen}
				options={{
					drawerLabel: "Profile",
					headerTitle: "My Profile",
					drawerIcon: ({ color, size }) => <Ionicons name="person-outline" color={color} size={size} />,
				}}
			/>
			<Drawer.Screen
				name="settings"
				component={SettingsScreen}
				options={{
					drawerLabel: "Settings",
					headerTitle: "Settings",
					drawerIcon: ({ color, size }) => <Ionicons name="settings-outline" color={color} size={size} />,
				}}
			/>
			<Drawer.Screen
				name="transactions"
				component={TransactionsScreen}
				options={{
					drawerLabel: "Transactions",
					headerTitle: "Transactions",
					drawerIcon: ({ color, size }) => <Ionicons name="reader-outline" color={color} size={size} />,
				}}
			/>
			<Drawer.Screen
				name="company-earnings"
				component={SettingsScreen}
				options={{
					drawerLabel: "Earnings Calendar",
					headerTitle: "Earnings Calendar",
					drawerIcon: ({ color, size }) => <Ionicons name="calendar-outline" color={color} size={size} />,
				}}
				// trending-up
			/>
		</Drawer.Navigator>
	)
}

export default DrawerNavigator
