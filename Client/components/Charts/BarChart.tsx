import { View, Text } from "react-native"
import { Bar, CartesianChart, Line, useChartPressState } from "victory-native"
import inter from "../../assets/fonts/Inter24Light.ttf"
import robotoBold from "../../assets/fonts/Roboto-Bold.ttf"
import { useFont, LinearGradient, vec } from "@shopify/react-native-skia"
import { Text as SKText } from "@shopify/react-native-skia"
import { convertToInternationalCurrencySystem } from "../../data/utils"
import { useDerivedValue } from "react-native-reanimated"

type BarChartProps = {
	data: any[]
	xKey: string
	yKeys: string[]
	chartConfig?: {
		formatXLabel?: () => void
	}
	gradientColors?: string[]
}

function BarChart({ data, xKey, yKeys, chartConfig, lineConfig, chartHeight, gradientColors }: BarChartProps) {
	const font = useFont(inter, 13)
	const amountLabelFont = useFont(robotoBold, 16)
	const dataTextFont = useFont(robotoBold, 14)
	const { state, isActive } = useChartPressState({ x: 0, y: { [yKeys[0]]: 0 } })

	const yData = useDerivedValue(() => {
		const yKey = yKeys[0]
		const data = `$${new Intl.NumberFormat("en", { notation: "compact" }).format(state.y[yKey].value.value)}`
		return data
	}, [state])

	let activeItem = useDerivedValue(() => {
		// console.log(state.y[yKeys[0]].position.value)
		console.log(state.y[yKeys[0]].value.value)
		return data.findIndex((value) => value[xKey] === state.x.value.value)
	}).value
	if (activeItem < 0) {
		activeItem = 0
	}

	return (
		<View style={{ height: 300, width: "100%" }}>
			<CartesianChart
				data={data}
				xKey={xKey}
				yKeys={yKeys}
				domainPadding={{ left: 50, right: 50, top: 20 }}
				xAxis={{
					font: font,
					labelColor: "whitesmoke",
					formatXLabel:
						chartConfig && chartConfig.formatXLabel !== undefined
							? chartConfig.formatXLabel
							: (month) => {
									const date = new Date(2024, month - 1)
									return date.toLocaleString("default", { month: "short" })
								},
				}}
				yAxis={[
					{
						font: amountLabelFont,
						labelColor: "#7d7cf9",
						formatYLabel: (yLabel: number) => {
							return `$${convertToInternationalCurrencySystem(yLabel)}`
						},
					},
				]}
				chartPressState={state}
			>
				{({ points, chartBounds }) => {
					return (
						<>
							<SKText x={chartBounds.left + 10} y={20} font={dataTextFont} text={yData} color="white" style={"fill"} />
							{points[`${yKeys[0]}`].map((point, index) => {
								const barValue = point.y
								const chartHeight = chartBounds.bottom - chartBounds.top
								const barHeight = chartHeight - barValue!
								const barTopPos = chartHeight - barHeight
								const barBottomPos = chartHeight
								const isPointSelected = isActive
									? Math.abs(point.x - state.x.position.value) < 1.5 &&
										state.y[yKeys[0]].position.value >= barTopPos &&
										state.y[yKeys[0]].position.value <= barBottomPos
									: false
								console.log(data[activeItem][yKeys[0]])
								return (
									<Bar
										key={index}
										animate={{ type: "timing", duration: 250 }}
										chartBounds={chartBounds}
										innerPadding={0.3}
										// barCount={4}
										barWidth={53}
										points={[point]}
										roundedCorners={{ topLeft: 5, topRight: 5 }}
									>
										<LinearGradient
											start={vec(0, 0)}
											end={vec(0, 400)}
											colors={index == activeItem ? ["#013220", "#39ff14"] : gradientColors || ["#a78bfa", "#a78bfa50"]}
										/>
									</Bar>
								)
							})}
						</>
					)
				}}
			</CartesianChart>
		</View>
	)
}

export default BarChart
