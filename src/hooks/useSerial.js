import { useState, useRef, useCallback } from "react";

const HISTORY_LIMIT = 40; // quantos pontos manter no histórico de cada sensor

/**
 * Espera que o Arduino envie linhas no formato:
 *   temp:25.3,umid:60,luz:512
 * (Serial.println("temp:" + String(t) + ",umid:" + String(h) + ",luz:" + String(l));)
 *
 * Cada chave vira um sensor separado, com valor atual + histórico.
 */
function parseLine(line) {
  const result = {};
  line.split(",").forEach((pair) => {
    const [key, value] = pair.split(":").map((s) => s?.trim());
    if (key && value !== undefined && !isNaN(parseFloat(value))) {
      result[key] = parseFloat(value);
    }
  });
  return result;
}

export function useSerial() {
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState(null);
  const [readings, setReadings] = useState({}); // { temp: 25.3, umid: 60, ... }
  const [history, setHistory] = useState({}); // { temp: [25.1, 25.3, ...], ... }
  const [lastUpdate, setLastUpdate] = useState(null);

  const portRef = useRef(null);
  const readerRef = useRef(null);
  const keepReadingRef = useRef(false);

  const isSupported = typeof navigator !== "undefined" && "serial" in navigator;

  const connect = useCallback(async (baudRate = 9600) => {
    if (!isSupported) {
      setError("Web Serial API não é suportada neste navegador. Use Chrome ou Edge.");
      return;
    }
    setError(null);
    setConnecting(true);
    try {
      const port = await navigator.serial.requestPort();
      await port.open({ baudRate });
      portRef.current = port;
      keepReadingRef.current = true;
      setConnected(true);

      const decoder = new TextDecoderStream();
      port.readable.pipeTo(decoder.writable);
      const reader = decoder.readable.getReader();
      readerRef.current = reader;

      let buffer = "";
      while (keepReadingRef.current) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += value;

        const lines = buffer.split("\n");
        buffer = lines.pop(); // guarda pedaço incompleto pra próxima leitura

        for (const rawLine of lines) {
          const line = rawLine.trim();
          if (!line) continue;
          const parsed = parseLine(line);
          if (Object.keys(parsed).length === 0) continue;

          setReadings((prev) => ({ ...prev, ...parsed }));
          setHistory((prev) => {
            const next = { ...prev };
            Object.entries(parsed).forEach(([key, value]) => {
              const arr = next[key] ? [...next[key], value] : [value];
              next[key] = arr.slice(-HISTORY_LIMIT);
            });
            return next;
          });
          setLastUpdate(new Date());
        }
      }
    } catch (err) {
      setError(err.message || "Erro ao conectar na porta serial.");
      setConnected(false);
    } finally {
      setConnecting(false);
    }
  }, [isSupported]);

  const disconnect = useCallback(async () => {
    keepReadingRef.current = false;
    try {
      await readerRef.current?.cancel();
      readerRef.current?.releaseLock?.();
      await portRef.current?.close();
    } catch (err) {
      // porta já pode ter sido fechada, ignora
    }
    setConnected(false);
  }, []);

  return {
    isSupported,
    connected,
    connecting,
    error,
    readings,
    history,
    lastUpdate,
    connect,
    disconnect,
  };
}