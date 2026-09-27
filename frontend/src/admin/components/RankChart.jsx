const CHART_HEIGHT = 320;
const LEFT_PADDING = 56;
const RIGHT_PADDING = 24;
const TOP_PADDING = 20;
const BOTTOM_PADDING = 52;
const Y_TICKS = [0, 25, 50, 75, 100];

const formatDate = (value) => {
	const date = new Date(value);
	return Number.isNaN(date.getTime())
		? "Date unavailable"
		: date.toLocaleDateString();
};

export default function RankChart({ attempts = [] }) {
	if (attempts.length === 0) {
		return <p className="text-gray-500">No performance data available</p>;
	}

	const chartWidth = Math.max(720, attempts.length * 72 + LEFT_PADDING + RIGHT_PADDING);
	const plotWidth = chartWidth - LEFT_PADDING - RIGHT_PADDING;
	const plotHeight = CHART_HEIGHT - TOP_PADDING - BOTTOM_PADDING;
	const points = attempts.map((attempt, index) => {
		const x = attempts.length === 1
			? LEFT_PADDING + plotWidth / 2
			: LEFT_PADDING + (index / (attempts.length - 1)) * plotWidth;
		const y = TOP_PADDING + ((100 - attempt.score) / 100) * plotHeight;

		return { ...attempt, x, y, attemptNumber: index + 1 };
	});
	const linePoints = points.map(({ x, y }) => `${x},${y}`).join(" ");

	return (
		<div className="w-full overflow-x-auto" aria-label="Candidate performance line chart">
			<svg
				className="w-full h-auto min-w-[640px]"
				viewBox={`0 0 ${chartWidth} ${CHART_HEIGHT}`}
				role="img"
				aria-label="Completed assessment scores in chronological order"
			>
				{Y_TICKS.map((tick) => {
					const y = TOP_PADDING + ((100 - tick) / 100) * plotHeight;

					return (
						<g key={tick}>
							<line
								x1={LEFT_PADDING}
								y1={y}
								x2={chartWidth - RIGHT_PADDING}
								y2={y}
								stroke="#e5e7eb"
								strokeDasharray={tick === 0 ? undefined : "4 4"}
							/>
							<text
								x={LEFT_PADDING - 12}
								y={y + 4}
								textAnchor="end"
								fill="#6b7280"
								fontSize="12"
							>
								{tick}
							</text>
						</g>
					);
				})}

				<line
					x1={LEFT_PADDING}
					y1={TOP_PADDING}
					x2={LEFT_PADDING}
					y2={CHART_HEIGHT - BOTTOM_PADDING}
					stroke="#9ca3af"
				/>
				<line
					x1={LEFT_PADDING}
					y1={CHART_HEIGHT - BOTTOM_PADDING}
					x2={chartWidth - RIGHT_PADDING}
					y2={CHART_HEIGHT - BOTTOM_PADDING}
					stroke="#9ca3af"
				/>

				<text
					x={16}
					y={TOP_PADDING + plotHeight / 2}
					textAnchor="middle"
					fill="#6b7280"
					fontSize="12"
					transform={`rotate(-90 16 ${TOP_PADDING + plotHeight / 2})`}
				>
					Score (%)
				</text>

				<polyline
					points={linePoints}
					fill="none"
					stroke="#7e22ce"
					strokeWidth="3"
					strokeLinejoin="round"
					strokeLinecap="round"
				/>

				{points.map((point) => (
					<g key={point.attempt_id}>
						<circle
							cx={point.x}
							cy={point.y}
							r="5"
							fill="#7e22ce"
							stroke="white"
							strokeWidth="2"
							aria-label={`Attempt ${point.attemptNumber}: ${point.score}% on ${formatDate(point.completed_at)}`}
						>
							  <title>{`Attempt ${point.attemptNumber} | ${formatDate(point.completed_at)} | ${point.test_type || "Assessment"} | ${point.score}%`}</title>
						</circle>
						<text
							x={point.x}
							y={CHART_HEIGHT - BOTTOM_PADDING + 22}
							textAnchor="middle"
							fill="#6b7280"
							fontSize="12"
						>
							{point.attemptNumber}
						</text>
					</g>
				))}

				<text
					x={LEFT_PADDING + plotWidth / 2}
					y={CHART_HEIGHT - 8}
					textAnchor="middle"
					fill="#6b7280"
					fontSize="12"
				>
					Attempt number (chronological)
				</text>
			</svg>
		</div>
	);
}
