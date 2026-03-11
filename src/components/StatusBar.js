"use client";

const STATUSES = ["ordered", "arrived", "inspecting", "passed", "dispatched", "delivered"];
const STATUS_LABELS = {
    ordered: "Ordered",
    arrived: "Arrived",
    inspecting: "Inspecting",
    passed: "Verified",
    failed: "Failed",
    dispatched: "Dispatched",
    delivered: "Delivered",
};

export default function StatusBar({ status }) {
    const isFailed = status === "failed";
    const currentIndex = STATUSES.indexOf(status);

    return (
        <div style={{ width: "100%", marginTop: "12px" }}>
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0",
                    position: "relative",
                }}
            >
                {STATUSES.map((s, i) => {
                    const isActive = i <= currentIndex && !isFailed;
                    const isCurrent = s === status;

                    return (
                        <div
                            key={s}
                            style={{
                                flex: 1,
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                position: "relative",
                            }}
                        >
                            {/* Connector line */}
                            {i > 0 && (
                                <div
                                    style={{
                                        position: "absolute",
                                        top: "12px",
                                        left: "-50%",
                                        right: "50%",
                                        height: "3px",
                                        background: isActive ? "var(--olive)" : "var(--sand3)",
                                        transition: "background 0.5s ease",
                                        zIndex: 0,
                                    }}
                                />
                            )}

                            {/* Dot */}
                            <div
                                style={{
                                    width: "24px",
                                    height: "24px",
                                    borderRadius: "50%",
                                    background: isFailed && isCurrent
                                        ? "#c04040"
                                        : isActive
                                            ? "var(--olive)"
                                            : "var(--sand2)",
                                    border: isCurrent
                                        ? isFailed
                                            ? "3px solid #fde8e8"
                                            : "3px solid var(--olive-mid)"
                                        : "3px solid transparent",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    position: "relative",
                                    zIndex: 1,
                                    transition: "all 0.3s ease",
                                    animation: isCurrent && !isFailed ? "pulse 2s infinite" : "none",
                                }}
                            >
                                {isActive && (
                                    <span style={{ color: "#fff", fontSize: "0.65rem", fontWeight: 800 }}>✓</span>
                                )}
                                {isFailed && isCurrent && (
                                    <span style={{ color: "#fff", fontSize: "0.65rem", fontWeight: 800 }}>✗</span>
                                )}
                            </div>

                            {/* Label */}
                            <span
                                style={{
                                    fontSize: "0.62rem",
                                    fontWeight: isCurrent ? 700 : 500,
                                    color: isFailed && isCurrent ? "#c04040" : isActive ? "var(--olive2)" : "var(--stone2)",
                                    marginTop: "6px",
                                    textTransform: "uppercase",
                                    letterSpacing: "0.06em",
                                    textAlign: "center",
                                    whiteSpace: "nowrap",
                                }}
                            >
                                {STATUS_LABELS[s]}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
