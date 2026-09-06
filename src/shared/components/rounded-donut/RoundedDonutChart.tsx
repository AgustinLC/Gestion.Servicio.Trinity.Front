import React from "react";
import { arc as d3Arc, type DefaultArcObject } from "d3-shape";

interface ArcDatum extends DefaultArcObject {
    cornerRadius: number;
}

export interface RoundedDonutSegment {
    value: number;
    color: string;
}

interface RoundedDonutChartProps {
    data: RoundedDonutSegment[];
    size: number;
    innerRadius: number;
    outerRadius: number;
    cornerRadius: number;
    paddingAngle?: number;
}

const MAX_CORNER_ANGLE_FRACTION = 0.1;

const getSafeCornerRadius = (
    desired: number,
    innerRadius: number,
    spanRad: number
) => {
    const maxTheta = spanRad * MAX_CORNER_ANGLE_FRACTION;
    return Math.min(desired, innerRadius * Math.sin(maxTheta));
};

const RoundedDonutChart: React.FC<RoundedDonutChartProps> = ({
    data,
    size,
    innerRadius,
    outerRadius,
    cornerRadius,
    paddingAngle = 3,
}) => {
    const visibleSegments = data.filter((segment) => segment.value > 0);
    const total = visibleSegments.reduce(
        (sum, segment) => sum + segment.value,
        0
    );
    if (total <= 0) return null;

    const padRad = (paddingAngle * Math.PI) / 180;
    const availableAngle = 2 * Math.PI - visibleSegments.length * padRad;
    const generator = d3Arc<ArcDatum>()
        .innerRadius(innerRadius)
        .outerRadius(outerRadius)
        .cornerRadius((d) => d.cornerRadius);

    let cursor = -Math.PI / 2;
    const arcs = visibleSegments.map((segment) => {
        const startAngle = cursor;
        const endAngle = startAngle + (segment.value / total) * availableAngle;
        cursor = endAngle + padRad;
        return {
            color: segment.color,
            d: generator({
                startAngle,
                endAngle,
                innerRadius,
                outerRadius,
                cornerRadius: getSafeCornerRadius(
                    cornerRadius,
                    innerRadius,
                    endAngle - startAngle
                ),
            }),
        };
    });

    const center = size / 2;

    return (
        <svg
            width={size}
            height={size}
            viewBox={`${-center} ${-center} ${size} ${size}`}
            aria-hidden="true"
        >
            {arcs.map((arc, index) => (
                <path key={index} d={arc.d ?? undefined} fill={arc.color} />
            ))}
        </svg>
    );
};

export default RoundedDonutChart;
