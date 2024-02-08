import { Card, Tab, Tabs, Typography } from "@mui/material";
import { DateTime } from "luxon";
import { useState } from "react";
import { Importer, ImporterField } from "react-csv-importer";
import "react-csv-importer/dist/index.css";
import TimeSeriesChart from "./TimeSeriesChart";
import MultiChartDisplay from "./MultiChartDisplay";

export type TimeSeries = Record<string, Record<string, [Date, number][]>>;
interface InputData {
  name: string;
  temperature: string;
  datetime: string;
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}
function transformData(inputData: InputData[]): TimeSeries {
  const timeSeries: TimeSeries = {};

  inputData.forEach(({ name, temperature, datetime }) => {
    const date = DateTime.fromISO(datetime).toISODate();
    if (!timeSeries[name]) {
      timeSeries[name] = {};
    }
    if (!timeSeries[name][date]) {
      timeSeries[name][date] = [];
    }
    timeSeries[name][date].push([
      DateTime.fromISO(datetime).toJSDate(),
      parseFloat(temperature),
    ]);
  });

  return timeSeries;
}

function mergeTimeSeries(
  existingTimeSeries: TimeSeries,
  newTimeSeries: TimeSeries
): TimeSeries {
  for (const fieldName in newTimeSeries) {
    if (Object.prototype.hasOwnProperty.call(newTimeSeries, fieldName)) {
      if (!existingTimeSeries[fieldName]) {
        existingTimeSeries[fieldName] = {};
      }
      for (const date in newTimeSeries[fieldName]) {
        if (
          Object.prototype.hasOwnProperty.call(newTimeSeries[fieldName], date)
        ) {
          if (!existingTimeSeries[fieldName][date]) {
            existingTimeSeries[fieldName][date] = [];
          }
          existingTimeSeries[fieldName][date].push(
            ...newTimeSeries[fieldName][date]
          );
        }
      }
    }
  }
  return existingTimeSeries;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <div className="p-3">
          <Typography>{children}</Typography>
        </div>
      )}
    </div>
  );
}
export const CSVImporter = () => {
  const [data, setData] = useState<TimeSeries>();
  const [showChart, setShowChart] = useState<boolean>(false);
  const [value, setValue] = useState(0);
  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };
  return (
    <Card className="border-gray-100 w-full h-400 !rounded-xl !shadow-lg grid grid-flow-row gap-4 p-4">
      <Typography
        className="whitespace-nowrap w-full leading-none"
        variant="h5"
        component="h5"
        fontWeight={800}
      >
        Steadytemp Visualizer
      </Typography>
      <Importer
        dataHandler={(rows, { startIndex }) => {
          setData((old) => {
            const newData = transformData(rows as any as InputData[]);
            return old ? mergeTimeSeries(old, newData) : newData;
          });
        }}
        onStart={({ file, preview, fields, columnFields }) => {
          // optional, invoked when user has mapped columns and started import
          setShowChart(false);
          setData(undefined);
        }}
        defaultNoHeader={false} // optional, keeps "data has headers" checkbox off by default
        restartable={true} // optional, lets user choose to upload another file when import is complete
        onComplete={() => {
          setShowChart(true);
        }}
        chunkSize={10000000} // defaults to 10000
        // CSV options passed directly to PapaParse if specified:
        // delimiter={...}
        // newline={...}
        // quoteChar={...}
        // escapeChar={...}
        // comments={...}
        // skipEmptyLines={...}
        // delimitersToGuess={...}
        // chunkSize={...} // defaults to 10000
        // encoding={...} // defaults to utf-8, see FileReader API
      >
        <ImporterField name="name" label="Name" />
        <ImporterField name="temperature" label="Temperature" />
        <ImporterField name="datetime" label="Date/Time" optional />
      </Importer>
      <Tabs
        value={value}
        onChange={handleChange}
        aria-label="basic tabs example"
      >
        <Tab label="Vue Combinée" {...a11yProps(0)} />
        <Tab label="Vue en Liste" {...a11yProps(1)} />
      </Tabs>
      <CustomTabPanel value={value} index={0}>
        {showChart && data && <TimeSeriesChart timeSeries={data} />}{" "}
      </CustomTabPanel>
      <CustomTabPanel value={value} index={1}>
        {showChart && data && <MultiChartDisplay timeSeries={data} />}
      </CustomTabPanel>
    </Card>
  );
};
