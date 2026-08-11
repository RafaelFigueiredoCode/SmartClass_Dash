import "./SensorCard.css";

const LABELS = {
  temp: { label: "Temperatura", unit: "°C", accent: "#ffb454" },
  umid: { label: "Umidade", unit: "%", accent: "#5eead4" },
  luz: { label: "Luminosidade", unit: "lx", accent: "#c084fc" },
};

function Sparkline({ points, accent }) {
  if (!points || points.length < 2) {
    return <div className="sensor-card__spark sensor-card__spark--empty" />;
  }
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;
  const w = 160;
  const h = 40;
  const step = w / (points.length - 1);

  const path = points
    .map((p, i) => {
      const x = i * step;
      const y = h - ((p - min) / range) * h;
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <svg className="sensor-card__spark" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
      <path d={path} fill="none" stroke={accent} strokeWidth="2" />
    </svg>
  );
}

export default function SensorCard({ sensorKey, value, history }) {
  const meta = LABELS[sensorKey] || { label: sensorKey, unit: "", accent: "#94a3b8" };

  return (
    <div className="sensor-card" style={{ "--accent": meta.accent }}>
      <div className="sensor-card__header">
        <span className="sensor-card__dot" />
        <span className="sensor-card__label">{meta.label}</span>
      </div>
      <div className="sensor-card__value">
        {value !== undefined ? value.toFixed(1) : "--"}
        <span className="sensor-card__unit">{meta.unit}</span>
      </div>
      <Sparkline points={history} accent={meta.accent} />
    </div>
  );
}