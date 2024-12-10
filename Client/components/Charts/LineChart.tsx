import { View } from "react-native"
import { Area, CartesianChart, Line, useChartPressState } from "victory-native"
import inter from "../../assets/fonts/Inter24Light.ttf"
import robotoBold from "../../assets/fonts/Roboto-Bold.ttf"
import { Circle, LinearGradient, useFont, vec, Text as SKText } from "@shopify/react-native-skia"
import { useDerivedValue, type SharedValue } from "react-native-reanimated"
import { StockPriceData } from "../../types/app-types"
import { useEffect, useState } from "react"

type LineChartProps = {
	data: StockPriceData[] | []
	xKey: string
	yKeys: string[]
	chartConfig: {
		domainPadding: {
			top?: number
			right?: number
		}
		axisOptions: {
			labelColor: string
			lineColor: string
		}
		formatXLabel?: any
	}
	lineConfig: {
		color: string
	}
	chartHeight: number
	gradientColors: string[]
}

export default function LineChart({
	data,
	xKey,
	yKeys,
	chartConfig,
	lineConfig,
	chartHeight,
	gradientColors,
}: LineChartProps) {
	const font = useFont(inter, 13)
	const amountLabelFont = useFont(robotoBold, 19)
	const [textWidth, setTextWidth] = useState(0)
	const { state, isActive } = useChartPressState({ x: 0, y: { [yKeys[0]]: 0 } })

	useEffect(() => {
		if (amountLabelFont) {
			const textWidth = amountLabelFont?.measureText(state.y[yKeys[0]].value.value.toFixed(2)).width
			setTextWidth(textWidth)
		}
	}, [amountLabelFont, state.y[yKeys[0]].value])

	const valueOnChart = useDerivedValue(() => {
		const yKey = yKeys[0]
		return "$" + state.y[yKey].value.value.toFixed(2)
	}, [state])

	const centeredTextX = useDerivedValue(() => {
		const halfTextWidth = textWidth / 2
		return Math.max(Math.min(state.x.position.value - halfTextWidth, 300), 35)
	}, [state.x.position, textWidth])

	return (
		<View style={{ height: chartHeight }}>
			<CartesianChart
				data={data}
				xKey={xKey}
				yKeys={yKeys}
				domain={chartConfig.domain ? chartConfig.domain : undefined}
				domainPadding={chartConfig.domainPadding ? chartConfig.domainPadding : undefined}
				axisOptions={{
					...chartConfig.axisOptions,
					font,
					formatYLabel: (yLabel) => {
						return `${yLabel}$`
					},
					formatXLabel: chartConfig.formatXLabel && chartConfig.formatXLabel,
					tickCount: {
						x: 3,
						y: 5,
					},
				}}
				chartPressState={state}
				// domain={{ y: [-10, 100] }} upper and lower bounds of each axis
			>
				{({ points, chartBounds }) => {
					return (
						<>
							<SKText
								x={centeredTextX}
								y={20}
								font={amountLabelFont}
								text={valueOnChart}
								color="white"
								style={"fill"}
							/>
							<Line
								{...lineConfig}
								points={points[`${yKeys[0]}`]}
								strokeWidth={3}
								animate={{ type: "timing", duration: 300 }}
							/>
							<Area points={points[`${yKeys[0]}`]} y0={chartBounds.bottom} animate={{ type: "timing", duration: 300 }}>
								<LinearGradient
									start={vec(chartBounds.bottom, 200)}
									end={vec(chartBounds.bottom, chartBounds.bottom)}
									colors={gradientColors}
								/>
							</Area>
							{isActive ? <Tooltip x={state.x.position} y={state.y[`${yKeys[0]}`].position} /> : null}
						</>
					)
				}}
			</CartesianChart>
		</View>
	)
}

const Tooltip = ({ x, y }: { x: SharedValue<number>; y: SharedValue<number> }) => {
	return <Circle cx={x} cy={y} r={7} color="whitesmoke" opacity={0.8} />
}
