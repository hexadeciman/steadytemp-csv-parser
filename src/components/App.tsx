import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import dayjs from "dayjs";
import updateLocale from "dayjs/plugin/updateLocale";

import { CSVImporter } from "./CSVImporter";

dayjs.extend(updateLocale);

dayjs.updateLocale("en", {
  weekStart: 1,
});

export const App = () => {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <BrowserRouter>
        <div className="w-full flex justify-center min-h-full">
          <div className="border border-color-black w-full bg-gray-50">
            <div className="grid gap-4 p-2">
              <Routes>
                <Route path="/" element={<CSVImporter />} />
              </Routes>
            </div>
            {/* <ResultsGrid /> */}
          </div>
        </div>
      </BrowserRouter>
    </LocalizationProvider>
  );
};
