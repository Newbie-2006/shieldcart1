"use client";

const STEPS = [
  { key: "ordered", label: "Ordered", icon: "📦" },
  { key: "arrived_at_hub", label: "At Hub", icon: "🏢" },
  { key: "inspecting", label: "Inspecting", icon: "🔍" },
  { key: "passed", label: "Verified", icon: "✅" },
  { key: "dispatched", label: "Dispatched", icon: "🚚" },
  { key: "delivered", label: "Delivered", icon: "🏠" },
];

export default function StatusBar({ status }) {
  const currentIdx = STEPS.findIndex((s) => s.key === status);

  return (
    <div style={{ position: "relative", padding: "16px 0" }}>
      {/* Progress Line */}
      <div
        style={{
          position: "absolute",
          top: "32px",
          left: "24px",
          right: "24px",
          height: "4px",
          background: "#E5E7EB",
          borderRadius: "4px",
          zIndex: 0,
        }}
      >
        <div
          style={{
            width: `${Math.max(0, (currentIdx / (STEPS.length - 1)) * 100)}%`,
            height: "100%",
            background: "linear-gradient(90deg, #2563EB, #10B981)",
            borderRadius: "4px",
            transition: "width 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        />
      </div>

      {/* Steps */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          position: "relative",
          zIndex: 1,
        }}
      >
        {STEPS.map((step, i) => {
          const done = i <= currentIdx;
          const active = i === currentIdx;
          return (
            <div
              key={step.key}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "8px",
                flex: 1,
              }}
            >
              <div
                style={{
                  width: active ? "38px" : "32px",
                  height: active ? "38px" : "32px",
                  borderRadius: "10px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: active ? "1rem" : "0.85rem",
                  background: done
                    ? active
                      ? "linear-gradient(135deg, #2563EB, #10B981)"
                      : "#EFF6FF"
                    : "#F3F4F6",
                  border: done ? "2px solid transparent" : "2px solid #E5E7EB",
                  boxShadow: active ? "0 4px 12px rgba(37,99,235,0.3)" : "none",
                  transition: "all 0.3s",
                }}
              >
                {done ? (active ? step.icon : "✓") : step.icon}
              </div>
              <span
                style={{
                  fontSize: "0.68rem",
                  fontWeight: done ? 600 : 500,
                  color: done ? (active ? "#2563EB" : "#374151") : "#9CA3AF",
                  whiteSpace: "nowrap",
                  letterSpacing: "0.02em",
                }}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
