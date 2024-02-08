import React, { useLayoutEffect, useState } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { TimeSeries } from "./CSVImporter";

interface Props {
  timeSeries: TimeSeries;
}

const MultiChartDisplay: React.FC<Props> = ({ timeSeries }) => {
  const [newkey, setNewKey] = useState(1);
  useLayoutEffect(() => {
    const handleResize = () => {
      setNewKey(Math.random());
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div>
      {Object.keys(timeSeries).map((label) => (
        <div key={label}>
          <h2>{label}</h2>
          <div>
            {Object.keys(timeSeries[label]).map((day) => (
              <div key={day}>
                <h3>{day}</h3>
                <HighchartsReact
                  key={newkey}
                  highcharts={Highcharts}
                  containerProps={{ style: { width: "100%" } }}
                  options={{
                    title: { text: `${label} - ${day}` },
                    useUTC: false, // Setting useUTC to false here
                    xAxis: {
                      min: new Date(timeSeries[label][day][0][0]).setHours(
                        0,
                        0,
                        0,
                        0
                      ),
                      max: new Date(timeSeries[label][day][0][0]).setHours(
                        23,
                        59,
                        59,
                        59
                      ),
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
                    tooltip: {
                      formatter: function () {
                        return (
                          "<b>" +
                          Highcharts.dateFormat("%Hh%M", this.x) +
                          "</b>" +
                          ": " +
                          this.y +
                          "°C"
                        );
                      },
                    },
                    series: [
                      {
                        data: timeSeries[label][day].map(([date, value]) => ({
                          x: date.getTime(),
                          y: value,
                        })),
                        marker: {
                          enabled: false, // This disables the little dots on each data point
                        },
                      },
                    ],
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default MultiChartDisplay;
