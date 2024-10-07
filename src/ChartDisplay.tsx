import React from "react";
import { BarChart } from "@mui/x-charts/BarChart"; // MUI X ChartsのBarChartをインポート

interface ChartDisplayProps {
  rows: any[];
  columns: any[];
}

const ChartDisplay: React.FC<ChartDisplayProps> = ({ rows, columns }) => {
  const labels = rows.map((row) => row[columns[0].field]); // 1列目をラベルに使用
  const dataset = rows.map((row) => row[columns[1].field]); // 2列目をデータとして使用

  return (
    <BarChart
      xAxis={[{ data: labels, scaleType: "band" }]} // x軸にラベルをセット
      series={[
        {
          data: dataset,
          label: columns[1].headerName, // データセットのラベル
        },
      ]}
      width={500} // グラフの幅を指定
      height={400} // グラフの高さを指定
    />
  );
};

export default ChartDisplay;
