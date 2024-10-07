import React, { useState } from "react";
import CsvUpload from "./CsvUpload.tsx";
import ChartDisplay from "./ChartDisplay.tsx";
import LineChartDisplay from "./LineChartDisplay.tsx";
import DataGridDisplay from "./DataGrid.tsx";

const App: React.FC = () => {
  const [rows, setRows] = useState<any[]>([]);
  const [columns, setColumns] = useState<any[]>([]);

  const handleDataLoaded = (newRows: any[], newColumns: any[]) => {
    setRows(newRows);
    setColumns(newColumns);
  };

  // stuckdbarchartで近年のデータとの差が大きいデータのみ着色
  //移動平均
  //ヒートマップ
  //大阪　愛媛比較
  //移動平均
  return (
    <div>
      <h1>CSVデータを読み込んで表示</h1>
      <CsvUpload onDataLoaded={handleDataLoaded} />
      {rows.length > 0 && columns.length > 0 && (
        <>
          <h2>Barチャート</h2>
          <ChartDisplay rows={rows} columns={columns} />
          {/* <h2>折れ線グラフ</h2>
          <LineChartDisplay rows={rows} columns={columns} /> */}
          <h2>DataGrid 表示</h2>
          <DataGridDisplay rows={rows} columns={columns} />
        </>
      )}
    </div>
  );
};

export default App;
