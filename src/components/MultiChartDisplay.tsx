import React, { useCallback, useLayoutEffect, useRef, useState } from "react";
import Highcharts, { ChartSelectionCallbackFunction, Point } from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { TimeSeries } from "./CSVImporter";
import { classNames } from "../utils/cn";
import { DataPoint, Stats } from "./Stats";
import { DateTime } from "luxon";

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

  const [selectedData, setSelectedData] = useState<Record<string, DataPoint[]>>(
    {}
  );

  const chartRef = useRef({}); // Ref to access Highcharts chart instance
  const resetPlot = (key: string) => {
    (chartRef.current as any)[key].chart.xAxis[0].removePlotBand(
      "highlightBand"
    );
  };
  const resetSelection = (key: string) => {
    setSelectedData((old) => ({
      ...old,
      [key]: [],
    }));
    resetPlot(key);
  };
  const handleSelection: (day: string) => ChartSelectionCallbackFunction =
    useCallback(
      (day: string) => (event) => {
        if (event.xAxis) {
          const xMin = event.xAxis[0].min;
          const xMax = event.xAxis[0].max;

          // Get the data within the selected area
          const selectedPoints = (event as any).target.series[0].data.filter(
            (point: Point) => point.x >= xMin && point.x <= xMax
          );

          // Extract the data from the selected points
          const data: DataPoint[] = selectedPoints.map((point: any) => ({
            x: point.x,
            y: point.y,
          }));

          // Set the selected data to the state
          setSelectedData((old) => ({
            ...old,
            [day]: data,
          }));

          // Check if plot band already exists, remove it if so
          if (
            (chartRef.current as any)[day].chart.xAxis[0].plotLinesAndBands
              .length > 0
          ) {
            resetPlot(day);
          }
          if (selectedPoints.length) {
            (chartRef.current as any)[day].chart.xAxis[0].addPlotBand({
              id: "highlightBand",
              color: "#6563f24d",
              from: xMin,
              to: xMax,
              label: {
                align: "left", // Positioning of the label.
              },
            });
          }
        }

        return false; // Prevent default zoom behavior
      },
      []
    );
  return (
    <div>
      {Object.keys(timeSeries).map((label) => (
        <div key={label}>
          <div>
            {Object.keys(timeSeries[label]).map((day) => (
              <div key={day}>
                <div
                  key={newkey}
                  className={classNames("w-full grid grid-flow-col", {
                    "grid-cols-[1fr_min-content] gap-x-2": selectedData[day],
                  })}
                >
                  <HighchartsReact
                    ref={(ref) => {
                      chartRef.current = {
                        ...chartRef.current,
                        [day + label]: ref,
                      };
                    }}
                    highcharts={Highcharts}
                    containerProps={{ style: { width: "100%" } }}
                    options={{
                      chart: {
                        type: "line",
                        zoomType: "x",
                        events: {
                          selection: handleSelection(day + label),
                        },
                      },
                      title: {
                        text: `${label} - ${DateTime.fromFormat(
                          day,
                          "yyyy-MM-dd"
                        ).toFormat("dd LLL. yyyy")}`,
                      },
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
                          const date = new Date(this.x);
                          return (
                            "<b>" +
                            ("0" + date.getHours()).slice(-2) +
                            ":" +
                            ("0" + date.getMinutes()).slice(-2) +
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
                  {selectedData[day + label] &&
                    selectedData[day + label].length > 0 && (
                      <div className="w-full pt-12">
                        <Stats
                          data={selectedData[day + label]}
                          day={day}
                          onClose={() => resetSelection(day + label)}
                        />
                      </div>
                    )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default MultiChartDisplay;
