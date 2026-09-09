import { Line, Path, Polygon, Polyline, Svg, Text, View } from "@react-pdf/renderer";

import { formatCompactUsd } from "@/lib/reports/format";
import { colors, fonts, reportStyles } from "@/lib/reports/pdf/report-theme";
import type {
  ReportAllocationSlice,
  ReportHistoryPoint,
} from "@/lib/reports/types";

const CHART_HEIGHT = 100;
const CHART_WIDTH = 467;
const Y_AXIS_WIDTH = 48;
const PAD_X = 6;
const PAD_Y = 8;

export function ValueChart({ points }: { points: ReportHistoryPoint[] }) {
  if (points.length < 2) {
    return (
      <Text style={reportStyles.emptyRow}>
        No history available for this period.
      </Text>
    );
  }

  const values = points.map((point) => point.valueUsd);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const yTicks = [max, min + range / 2, min];

  const plotWidth = CHART_WIDTH - PAD_X * 2;
  const plotHeight = CHART_HEIGHT - PAD_Y * 2;

  const plotCoords = points.map((point, index) => ({
    x: PAD_X + (index / (points.length - 1)) * plotWidth,
    y:
      PAD_Y +
      plotHeight -
      ((point.valueUsd - min) / range) * plotHeight,
  }));

  const linePoints = plotCoords
    .map((coord) => `${coord.x},${coord.y}`)
    .join(" ");

  const areaPoints = [
    `${plotCoords[0].x},${PAD_Y + plotHeight}`,
    ...plotCoords.map((coord) => `${coord.x},${coord.y}`),
    `${plotCoords[plotCoords.length - 1].x},${PAD_Y + plotHeight}`,
  ].join(" ");

  const labelIndexes = [
    0,
    Math.floor((points.length - 1) / 2),
    points.length - 1,
  ];

  return (
    <View>
      <Text style={reportStyles.chartCaption}>
        Portfolio value (USD) by statement date
      </Text>

      <View style={{ flexDirection: "row", alignItems: "stretch" }}>
        <View
          style={{
            width: Y_AXIS_WIDTH,
            height: CHART_HEIGHT,
            justifyContent: "space-between",
            paddingVertical: 4,
            paddingRight: 4,
          }}
        >
          {yTicks.map((tick) => (
            <Text
              key={tick}
              style={[reportStyles.chartAxisLabel, { textAlign: "right" }]}
            >
              {formatCompactUsd(tick)}
            </Text>
          ))}
        </View>

        <Svg
          width={CHART_WIDTH}
          height={CHART_HEIGHT}
          viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
        >
          {[0, 0.5, 1].map((tick) => {
            const y = PAD_Y + plotHeight * (1 - tick);

            return (
              <Line
                key={tick}
                x1={PAD_X}
                y1={y}
                x2={PAD_X + plotWidth}
                y2={y}
                stroke={colors.rule}
                strokeWidth={0.75}
              />
            );
          })}
          <Polygon points={areaPoints} fill={colors.navy} fillOpacity={0.08} />
          <Polyline
            points={linePoints}
            fill="none"
            stroke={colors.navy}
            strokeWidth={1.75}
          />
        </Svg>
      </View>

      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          marginTop: 4,
          paddingLeft: Y_AXIS_WIDTH + 4,
          paddingRight: 8,
        }}
      >
        {labelIndexes.map((index) => (
          <Text key={index} style={reportStyles.chartAxisLabel}>
            {points[index].label}
          </Text>
        ))}
      </View>
    </View>
  );
}

export function AllocationChart({
  slices,
}: {
  slices: ReportAllocationSlice[];
}) {
  const cx = 56;
  const cy = 56;
  const radius = 44;
  let cumulative = 0;

  const paths = slices.map((slice) => {
    const start = (cumulative / 100) * 2 * Math.PI - Math.PI / 2;
    cumulative += slice.allocationPct;
    const end = (cumulative / 100) * 2 * Math.PI - Math.PI / 2;
    const x1 = cx + radius * Math.cos(start);
    const y1 = cy + radius * Math.sin(start);
    const x2 = cx + radius * Math.cos(end);
    const y2 = cy + radius * Math.sin(end);
    const largeArc = slice.allocationPct > 50 ? 1 : 0;

    return (
      <Path
        key={slice.key}
        d={`M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`}
        fill={slice.color}
      />
    );
  });

  const columns = [
    slices.filter((_, index) => index % 2 === 0),
    slices.filter((_, index) => index % 2 === 1),
  ];

  return (
    <View>
      <View style={{ alignItems: "center", marginBottom: 10 }}>
        <Svg width={112} height={112} viewBox="0 0 112 112">
          {paths}
        </Svg>
      </View>

      <View style={{ flexDirection: "row", gap: 16 }}>
        {columns.map((column, index) => (
          <View key={index} style={{ flex: 1 }}>
            {column.map((slice) => (
              <View
                key={slice.key}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 5,
                  marginBottom: 5,
                }}
              >
                <View
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: 1,
                    backgroundColor: slice.color,
                  }}
                />
                <Text
                  style={{ fontSize: 8, fontFamily: fonts.body, flex: 1 }}
                >
                  {slice.label}
                </Text>
                <Text style={{ fontSize: 8, fontFamily: fonts.bodyBold }}>
                  {slice.allocationPct.toFixed(1)}%
                </Text>
              </View>
            ))}
          </View>
        ))}
      </View>
    </View>
  );
}
