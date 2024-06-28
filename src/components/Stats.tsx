import { useMemo } from "react";
import { formatNumber } from "../utils/formatNumber";
import { classNames } from "../utils/cn";
import Close from "@mui/icons-material/Close";
import IconButton from "@mui/material/IconButton";
import { DateTime } from "luxon";

export interface DataPoint {
  x: number;
  y: number;
}

// Utility functions for statistical calculations
const formatTime = (timestamp: number): string =>
  DateTime.fromMillis(timestamp).toFormat("hh:mm:ss");
const calculateDuration = (data: DataPoint[]) => {
  return data.length > 0
    ? formatTime(data[data.length - 1].x - data[0].x)
    : "00h00m00";
};

const calculateStatistics = (
  data: DataPoint[],
  day: string
): { description: string; value: any }[] => {
  if (data.length === 0) return [];

  const values = data.map((point) => point.y);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const mean = values.reduce((a, b) => a + b, 0) / values.length;

  const sortedValues = [...values].sort((a, b) => a - b);
  const median =
    sortedValues.length % 2 === 0
      ? (sortedValues[sortedValues.length / 2 - 1] +
          sortedValues[sortedValues.length / 2]) /
        2
      : sortedValues[Math.floor(sortedValues.length / 2)];

  const variance =
    values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
  const stdDev = Math.sqrt(variance);

  const duration = calculateDuration(data);
  const mode = values
    .sort(
      (a, b) =>
        values.filter((v) => v === a).length -
        values.filter((v) => v === b).length
    )
    .pop();

  const q1 = sortedValues[Math.floor(sortedValues.length * 0.25)];
  const q3 = sortedValues[Math.floor(sortedValues.length * 0.75)];
  const iqr = q3 - q1;

  const minTime = new Date(Math.min(...data.map((point) => point.x)));
  const maxTime = new Date(Math.max(...data.map((point) => point.x)));

  return [
    {
      description: "Tranche",
      value: ` ${("0" + minTime.getHours()).slice(-2)}:${(
        "0" + minTime.getMinutes()
      ).slice(-2)} - ${("0" + maxTime.getHours()).slice(-2)}:${(
        "0" + maxTime.getMinutes()
      ).slice(-2)} • ${DateTime.fromFormat(day, "yyyy-MM-dd").toFormat(
        "dd LLL. yyyy"
      )}`,
    },
    {
      description: "Durée",
      value: duration,
    },
    { description: "Minimum", value: formatNumber(min, 2, "°C") },
    { description: "Maximum", value: formatNumber(max, 2, "°C") },
    { description: "Moyenne", value: formatNumber(mean, 2, "°C") },
    {
      description: "Médiane",
      value: formatNumber(median, 2, "°C"),
    },
    {
      description: "Premier Quartile (Q1)",
      value: formatNumber(q1, 2, "°C"),
    },
    {
      description: "Troisième Quartile (Q3)",
      value: formatNumber(q3, 2, "°C"),
    },
    { description: "Écart Type", value: formatNumber(stdDev, 2, "°C") },
    { description: "Variance", value: formatNumber(variance, 2, "°C²") },
    { description: "Mode", value: formatNumber(mode as number, 2, "°C") },
    {
      description: "Intervalle Interquartile (IQR)",
      value: formatNumber(iqr, 2, "°C"),
    },
  ];
};

export const Stats = ({
  data,
  day,
  onClose,
}: {
  data: DataPoint[];
  day: string;
  onClose: VoidFunction;
}) => {
  const statistics: { description: string; value: any }[] = useMemo(
    () => calculateStatistics(data, day),
    [data, day]
  );
  return (
    <div className="border border-slate-200 pb-2 rounded">
      <div className="mb-2 flex justify-between items-center px-1">
        <span className="font-extrabold">Statistiques (N={data.length})</span>
        <button></button>
        <IconButton onClick={onClose} size="small" aria-label="Fermer Paneau">
          <Close />
        </IconButton>
      </div>
      {statistics.map(({ description, value }, i) => (
        <div
          className={classNames(
            "flex justify-between gap-x-6 text-xs p-0.5 px-2",
            {
              "bg-slate-100": i % 2 === 0,
            }
          )}
        >
          <span>{description}</span>
          <span className="font-extrabold">{value}</span>
        </div>
      ))}
    </div>
  );
};
