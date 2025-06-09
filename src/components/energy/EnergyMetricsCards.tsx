import { Zap, TrendingUp, ThermometerSun, Droplet } from "lucide-react";
import { AnimatedCard } from "@/components/ui/animated-containers";
import { CountUpNumber, AnimatedNumber } from "@/components/ui/animated-numbers";

interface EnergyMetricsCardsProps {
  statistics: any;
  transitionCompleted: boolean;
}

export function EnergyMetricsCards({ statistics, transitionCompleted }: EnergyMetricsCardsProps) {
  if (!statistics) return null;

  // 從統計資料產生指標卡片
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {transitionCompleted ? (
        <>
          <AnimatedCard delay={0.1} duration={0.5}>
            <div
              className="glass-effect border rounded-lg p-3 data-card"
              style={{
                backgroundColor: "var(--metrics-temperature-bg)",
                borderColor: "var(--metrics-temperature-text)",
                borderWidth: "1px",
              }}
            >
              <div className="flex items-center gap-2">
                <Zap
                  className="h-4 w-4"
                  style={{ color: "var(--metrics-temperature-text)" }}
                />
                <span
                  className="text-sm font-medium"
                  style={{ color: "var(--metrics-temperature-text)" }}
                >
                  總耗電量
                </span>
              </div>
              <div
                className="text-2xl font-bold mt-1"
                style={{ color: "var(--metrics-temperature-text)" }}
              >
                <CountUpNumber
                  value={statistics.total_energy_kwh}
                  decimals={0}
                  duration={1.2}
                  suffix=" kWh"
                />
              </div>
              <div
                className="text-xs mt-1"
                style={{
                  color: "var(--metrics-temperature-text)",
                  opacity: 0.8,
                }}
              >
                預估花費: $
                <AnimatedNumber
                  value={statistics.cost_estimate_usd.toLocaleString()}
                />
              </div>
            </div>
          </AnimatedCard>

          <AnimatedCard delay={0.2} duration={0.5}>
            <div
              className="glass-effect border rounded-lg p-3 data-card"
              style={{
                backgroundColor: "var(--metrics-load-bg)",
                borderColor: "var(--metrics-load-text)",
                borderWidth: "1px",
              }}
            >
              <div className="flex items-center gap-2">
                <TrendingUp
                  className="h-4 w-4"
                  style={{ color: "var(--metrics-load-text)" }}
                />
                <span
                  className="text-sm font-medium"
                  style={{ color: "var(--metrics-load-text)" }}
                >
                  平均每小時耗電量
                </span>
              </div>
              <div
                className="text-2xl font-bold mt-1"
                style={{ color: "var(--metrics-load-text)" }}
              >
                <CountUpNumber
                  value={statistics.average_hourly_kwh}
                  decimals={1}
                  duration={1.2}
                  suffix=" kWh"
                />
              </div>
              <div
                className="mt-1 flex items-center text-xs"
                style={{
                  color: "var(--metrics-load-text)",
                  opacity: 0.8,
                }}
              >
                <ThermometerSun className="mr-1 h-3 w-3" />
                溫度相關性:{" "}
                <AnimatedNumber
                  value={(
                    statistics.temperature_correlation * 100
                  ).toFixed(0)}
                  suffix="%"
                />
              </div>
            </div>
          </AnimatedCard>

          <AnimatedCard delay={0.3} duration={0.5}>
            <div
              className="glass-effect border rounded-lg p-3 data-card"
              style={{
                backgroundColor: "var(--metrics-efficiency-bg)",
                borderColor: "var(--metrics-efficiency-text)",
                borderWidth: "1px",
              }}
            >
              <div className="flex items-center gap-2">
                <ThermometerSun
                  className="h-4 w-4"
                  style={{ color: "var(--metrics-efficiency-text)" }}
                />
                <span
                  className="text-sm font-medium"
                  style={{ color: "var(--metrics-efficiency-text)" }}
                >
                  尖峰用電
                </span>
              </div>
              <div
                className="text-2xl font-bold mt-1"
                style={{ color: "var(--metrics-efficiency-text)" }}
              >
                <CountUpNumber
                  value={statistics.peak_usage.energy_kwh}
                  decimals={0}
                  duration={1.2}
                  suffix=" kWh"
                />
              </div>
              <div
                className="mt-1 flex items-center text-xs"
                style={{
                  color: "var(--metrics-efficiency-text)",
                  opacity: 0.8,
                }}
              >
                <ThermometerSun className="mr-1 h-3 w-3" />
                當時溫度:{" "}
                <AnimatedNumber
                  value={statistics.peak_usage.temperature}
                  suffix="°C"
                />
              </div>
            </div>
          </AnimatedCard>

          <AnimatedCard delay={0.4} duration={0.5}>
            <div
              className="glass-effect border rounded-lg p-3 data-card"
              style={{
                backgroundColor: "var(--metrics-vibration-bg)",
                borderColor: "var(--metrics-vibration-text)",
                borderWidth: "1px",
              }}
            >
              <div className="flex items-center gap-2">
                <Droplet
                  className="h-4 w-4"
                  style={{ color: "var(--metrics-vibration-text)" }}
                />
                <span
                  className="text-sm font-medium"
                  style={{ color: "var(--metrics-vibration-text)" }}
                >
                  平均濕度
                </span>
              </div>
              <div
                className="text-2xl font-bold mt-1"
                style={{ color: "var(--metrics-vibration-text)" }}
              >
                <CountUpNumber
                  value={
                    statistics.average_humidity
                      ? statistics.average_humidity
                      : 50.0
                  }
                  decimals={1}
                  duration={1.2}
                  suffix="%"
                />
              </div>
              <div
                className="mt-1 flex items-center text-xs"
                style={{
                  color: "var(--metrics-vibration-text)",
                  opacity: 0.8,
                }}
              >
                適宜範圍: 40-60%
              </div>
            </div>
          </AnimatedCard>
        </>
      ) : (
        <>
          <div
            className="glass-effect border rounded-lg p-3 data-card"
            style={{
              backgroundColor: "var(--metrics-temperature-bg)",
              borderColor: "var(--metrics-temperature-text)",
              borderWidth: "1px",
            }}
          >
            <div className="flex items-center gap-2">
              <Zap
                className="h-4 w-4"
                style={{ color: "var(--metrics-temperature-text)" }}
              />
              <span
                className="text-sm font-medium"
                style={{ color: "var(--metrics-temperature-text)" }}
              >
                總耗電量
              </span>
            </div>
            <div
              className="text-2xl font-bold mt-1"
              style={{ color: "var(--metrics-temperature-text)" }}
            >
              {statistics.total_energy_kwh.toFixed(0)} kWh
            </div>
            <div
              className="text-xs mt-1"
              style={{
                color: "var(--metrics-temperature-text)",
                opacity: 0.8,
              }}
            >
              預估花費: ${statistics.cost_estimate_usd.toLocaleString()}
            </div>
          </div>

          <div
            className="glass-effect border rounded-lg p-3 data-card"
            style={{
              backgroundColor: "var(--metrics-load-bg)",
              borderColor: "var(--metrics-load-text)",
              borderWidth: "1px",
            }}
          >
            <div className="flex items-center gap-2">
              <TrendingUp
                className="h-4 w-4"
                style={{ color: "var(--metrics-load-text)" }}
              />
              <span
                className="text-sm font-medium"
                style={{ color: "var(--metrics-load-text)" }}
              >
                平均每小時耗電量
              </span>
            </div>
            <div
              className="text-2xl font-bold mt-1"
              style={{ color: "var(--metrics-load-text)" }}
            >
              {statistics.average_hourly_kwh.toFixed(1)} kWh
            </div>
            <div
              className="mt-1 flex items-center text-xs"
              style={{ color: "var(--metrics-load-text)", opacity: 0.8 }}
            >
              <ThermometerSun className="mr-1 h-3 w-3" />
              溫度相關性:{" "}
              {(statistics.temperature_correlation * 100).toFixed(0)}%
            </div>
          </div>

          <div
            className="glass-effect border rounded-lg p-3 data-card"
            style={{
              backgroundColor: "var(--metrics-efficiency-bg)",
              borderColor: "var(--metrics-efficiency-text)",
              borderWidth: "1px",
            }}
          >
            <div className="flex items-center gap-2">
              <ThermometerSun
                className="h-4 w-4"
                style={{ color: "var(--metrics-efficiency-text)" }}
              />
              <span
                className="text-sm font-medium"
                style={{ color: "var(--metrics-efficiency-text)" }}
              >
                尖峰用電
              </span>
            </div>
            <div
              className="text-2xl font-bold mt-1"
              style={{ color: "var(--metrics-efficiency-text)" }}
            >
              {statistics.peak_usage.energy_kwh.toFixed(0)} kWh
            </div>
            <div
              className="mt-1 flex items-center text-xs"
              style={{
                color: "var(--metrics-efficiency-text)",
                opacity: 0.8,
              }}
            >
              <ThermometerSun className="mr-1 h-3 w-3" />
              當時溫度: {statistics.peak_usage.temperature}°C
            </div>
          </div>

          <div
            className="glass-effect border rounded-lg p-3 data-card"
            style={{
              backgroundColor: "var(--metrics-vibration-bg)",
              borderColor: "var(--metrics-vibration-text)",
              borderWidth: "1px",
            }}
          >
            <div className="flex items-center gap-2">
              <Droplet
                className="h-4 w-4"
                style={{ color: "var(--metrics-vibration-text)" }}
              />
              <span
                className="text-sm font-medium"
                style={{ color: "var(--metrics-vibration-text)" }}
              >
                平均濕度
              </span>
            </div>
            <div
              className="text-2xl font-bold mt-1"
              style={{ color: "var(--metrics-vibration-text)" }}
            >
              {(statistics.average_humidity
                ? statistics.average_humidity
                : 50.0
              ).toFixed(1)}
              %
            </div>
            <div
              className="mt-1 flex items-center text-xs"
              style={{
                color: "var(--metrics-vibration-text)",
                opacity: 0.8,
              }}
            >
              適宜範圍: 40-60%
            </div>
          </div>
        </>
      )}
    </div>
  );
} 