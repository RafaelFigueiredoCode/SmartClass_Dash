import { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useSerial } from "../hooks/useSerial";
import SensorCard from "./SensorCard";
import "./dashboard.css";

const SERIES_COLORS = {
  temp: "#ffb454",
  umid: "#5eead4",
  luz: "#c084fc",
};

export default function Dashboard() {
  const {
    isSupported,
    connected,
    connecting,
    error,
    readings,
    history,
    lastUpdate,
    connect,
    disconnect,
  } = useSerial();

  const sensorKeys = Object.keys(readings);

  // transforma { temp: [1,2,3], umid: [4,5,6] } em [{i:0,temp:1,umid:4}, {i:1,temp:2,umid:5}, ...]
  const chartData = useMemo(() => {
    const maxLen = Math.max(0, ...sensorKeys.map((k) => history[k]?.length || 0));
    return Array.from({ length: maxLen }, (_, i) => {
      const point = { i };
      sensorKeys.forEach((key) => {
        const arr = history[key] || [];
        const offset = maxLen - arr.length;
        if (i >= offset) point[key] = arr[i - offset];
      });
      return point;
    });
  }, [history, sensorKeys]);

  return (
    <div className="dashboard">
      <header className="dashboard__header">
        <div>
          <h1 className="dashboard__title">Estação IoT</h1>
          <p className="dashboard__subtitle">Leitura em tempo real via porta serial</p>
        </div>

        <div className="dashboard__status">
          <span className={`dashboard__pulse ${connected ? "dashboard__pulse--live" : ""}`} />
          <span className="dashboard__status-text">
            {connected ? "Conectado" : connecting ? "Conectando..." : "Desconectado"}
          </span>
          <button
            className="dashboard__button"
            onClick={connected ? disconnect : () => connect()}
            disabled={connecting || !isSupported}
          >
            {connected ? "Desconectar" : "Conectar porta serial"}
          </button>
        </div>
      </header>

      {!isSupported && (
        <div className="dashboard__banner dashboard__banner--warn">
          Este navegador não suporta a Web Serial API. Use Chrome ou Edge.
        </div>
      )}
      {error && <div className="dashboard__banner dashboard__banner--error">{error}</div>}

      {sensorKeys.length === 0 ? (
        <div className="dashboard__empty">
          {connected
            ? "Conectado. Aguardando o Arduino enviar dados..."
            : "Conecte a porta serial para começar a receber leituras."}
        </div>
      ) : (
        <>
          <div className="dashboard__grid">
            {sensorKeys.map((key) => (
              <SensorCard
                key={key}
                sensorKey={key}
                value={readings[key]}
                history={history[key]}
              />
            ))}
          </div>

          <div className="dashboard__chart-panel">
            <div className="dashboard__chart-header">
              <span>Histórico combinado</span>
              {lastUpdate && (
                <span className="dashboard__chart-updated">
                  última leitura: {lastUpdate.toLocaleTimeString()}
                </span>
              )}
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={chartData}>
                <CartesianGrid stroke="#1f2b45" strokeDasharray="3 3" />
                <XAxis dataKey="i" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ background: "#121a2b", border: "1px solid #1f2b45" }}
                  labelStyle={{ color: "#94a3b8" }}
                />
                <Legend />
                {sensorKeys.map((key) => (
                  <Line
                    key={key}
                    type="monotone"
                    dataKey={key}
                    stroke={SERIES_COLORS[key] || "#94a3b8"}
                    strokeWidth={2}
                    dot={false}
                    isAnimationActive={false}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  );
}