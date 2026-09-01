import { Card, Row, Col } from "react-bootstrap";

interface DashboardSkeletonProps {
    kpiCount?: number;
    chartHeight?: number;
}

const DashboardSkeleton: React.FC<DashboardSkeletonProps> = ({
    kpiCount = 9,
    chartHeight = 260,
}) => {
    return (
        <div className="my-auto">
            <Row className="mb-2">
                {Array.from({ length: kpiCount }).map((_, index) => (
                    <Col key={index} xl={4} md={6} className="mb-2">
                        <div className="kpi-card">
                            <div className="kpi-card-icon skeleton"></div>
                            <div className="kpi-card-body flex-grow-1">
                                <div
                                    className="skeleton skeleton-line mb-2"
                                    style={{ width: "70%", height: 12 }}
                                ></div>
                                <div
                                    className="skeleton skeleton-line"
                                    style={{ width: "45%", height: 18 }}
                                ></div>
                            </div>
                            <div className="kpi-card-trend skeleton"></div>
                        </div>
                    </Col>
                ))}
                <Col md={8} className="mb-3">
                    <Card className="h-100 chart-card">
                        <Card.Body className="d-flex flex-column">
                            <div
                                className="skeleton skeleton-line mb-3"
                                style={{ width: "35%", height: 16 }}
                            ></div>
                            <div
                                className="flex-grow-1 d-flex align-items-end gap-3"
                                style={{ height: chartHeight }}
                            >
                                {[55, 85, 40, 70, 30, 50].map(
                                    (height, index) => (
                                        <div
                                            key={index}
                                            className="skeleton"
                                            style={{
                                                width: "14%",
                                                height: `${height}%`,
                                                borderRadius: "8px 8px 0 0",
                                            }}
                                        ></div>
                                    )
                                )}
                            </div>
                        </Card.Body>
                    </Card>
                </Col>

                <Col md={4} className="mb-3">
                    <Card className="h-100 chart-card">
                        <Card.Body>
                            <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                                <div
                                    className="skeleton skeleton-line"
                                    style={{ width: "55%", height: 16 }}
                                ></div>
                                <div
                                    className="skeleton skeleton-line"
                                    style={{
                                        width: 90,
                                        height: 32,
                                        borderRadius: 8,
                                    }}
                                ></div>
                            </div>
                            <div
                                className="skeleton"
                                style={{
                                    width: "100%",
                                    height: chartHeight,
                                    borderRadius: 12,
                                }}
                            ></div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default DashboardSkeleton;
