import React, { useState } from "react";
import CsvUpload from "./CsvUpload.tsx";
import ChartDisplay from "./ChartDisplay.tsx";
import DataGridDisplay from "./DataGrid.tsx";
import CsvLoadFromOpfs from "./Csvloadfromopfs.tsx";
import MinPie from "./MinPie.tsx";
import BoxPlot from "./boxplot.tsx";

const App: React.FC = () => {
  const [rows, setRows] = useState<any[]>([]);
  const [columns, setColumns] = useState<any[]>([]);

  const handleDataLoaded = (newRows: any[], newColumns: any[]) => {
    setRows(newRows);
    setColumns(newColumns);
  };

  return (
    <div>
      <h1>CSVデータを読み込んで表示</h1>
      <CsvUpload onDataLoaded={handleDataLoaded} />
      <h1>CSVをOPFSから読み込んで表示</h1>
      <CsvLoadFromOpfs onDataLoaded={handleDataLoaded} />
      {rows.length > 0 && columns.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div>
            <h2>DataGrid 表示</h2>
            <DataGridDisplay rows={rows} columns={columns} />
          </div>
          <div>
            <h2>Barチャート</h2>
            <ChartDisplay rows={rows} columns={columns} />
          </div>
          <div>
            <MinPie rows={rows} columns={columns} />
          </div>
          <div>
            <BoxPlot />
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
