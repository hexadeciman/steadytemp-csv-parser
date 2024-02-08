import React, { useLayoutEffect, useState } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { TimeSeries } from "./CSVImporter";

const resetDay = (date: Date) => {
  date.setDate(new Date().getDate());
  return date;
};

function TimeSeriesChart({ timeSeries }: { timeSeries: TimeSeries }) {
  const charts = [];
  const [newkey, setNewKey] = useState(1);
  useLayoutEffect(() => {
    const handleResize = () => {
      setNewKey(Math.random());
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  // Create a separate chart for each name
  for (const fieldName in timeSeries) {
    if (Object.prototype.hasOwnProperty.call(timeSeries, fieldName)) {
      const seriesData = [];

      // Prepare data for Highcharts
      for (const date in timeSeries[fieldName]) {
        if (Object.prototype.hasOwnProperty.call(timeSeries[fieldName], date)) {
          const dataPoints = timeSeries[fieldName][date].map(
            ([datetime, temperature]) => ({
              x: resetDay(datetime),
              y: temperature,
            })
          );
          seriesData.push({
            name: date,
            data: dataPoints,
            marker: {
              enabled: false, // This disables the little dots on each data point
            },
          });
        }
      }

      const options = {
        chart: {
          type: "line",
        },
        title: {
          text: fieldName,
        },
        xAxis: {
          type: "category", // Use category axis for time
          categories: [
            ...new Set(
              seriesData.flatMap((series) =>
                series.data.map((point) => point.x)
              )
            ),
          ], // Extract unique time values for x-axis categories
          labels: {
            rotation: -90, // Rotate labels for better visibility
            formatter: function () {
              const date = new Date(this.value);
              const hours = ("0" + date.getHours()).slice(-2); // Get hours (with leading zero)
              const minutes = ("0" + date.getMinutes()).slice(-2); // Get minutes (with leading zero)
              return hours + ":" + minutes; // Display label only for round 10-minute intervals
            },
            tickInterval: 5 * 60 * 1000, // Display ticks every hour (3600 seconds)
          },
        },
        yAxis: {
          title: {
            text: "Temperature",
          },
          tickInterval: 0.5, // Set tick interval to 1
        },
        tooltip: {
          formatter: function () {
            return (
              "<b>" +
              this.series.name +
              "</b><br/>" +
              Highcharts.dateFormat("%H:%M", this.x) +
              ": " +
              this.y +
              "°C"
            );
          },
        },
        series: seriesData,
      };

      charts.push(
        <HighchartsReact
          key={fieldName}
          highcharts={Highcharts}
          options={options}
        />
      );
    }
  }

  return <div key={newkey}>{charts}</div>;
}

export default TimeSeriesChart;
