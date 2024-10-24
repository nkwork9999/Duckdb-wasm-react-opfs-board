import React, { useState } from "react";
import { BarChart } from "@mui/x-charts/BarChart";
import { Checkbox, FormControlLabel, FormGroup } from "@mui/material";

interface ChartDisplayProps {
  rows: any[];
  columns: any[];
}

const ChartDisplay: React.FC<ChartDisplayProps> = ({ rows, columns }) => {
  // グラフに表示するデータのフィールドを保持するためのstate
  const [selectedFields, setSelectedFields] = useState<string[]>([
    columns[1].field,
  ]);

  // チェックボックスの変更をハンドリングする関数
  const handleCheckboxChange = (field: string) => {
    setSelectedFields((prevFields) =>
      prevFields.includes(field)
        ? prevFields.filter((f) => f !== field)
        : [...prevFields, field]
    );
  };

  const labels = rows.map((row) => row[columns[0].field]); // 1列目（DATE）をラベルに使用

  // チェックされているフィールドに基づいてデータを準備
  const dataset = selectedFields.map((field) => ({
    data: rows.map((row) => parseFloat(row[field]) || 0), // 数値に変換してデータを取得
    label: columns.find((col) => col.field === field)?.headerName || field,
  }));

  return (
    <div style={{ display: "flex", alignItems: "flex-start" }}>
      {" "}
      {/* Flexboxで横並びに */}
      <div style={{ flex: 1 }}>
        {" "}
        {/* グラフの領域 */}
        <BarChart
          xAxis={[{ data: labels, scaleType: "band" }]} // x軸に日付（DATE）をセット
          series={dataset} // 選択されたデータを表示
          width={500} // グラフの幅を指定
          height={400} // グラフの高さを指定
        />
      </div>
      <div style={{ marginLeft: "20px" }}>
        {" "}
        {/* チェックボックスの領域 */}
        <FormGroup>
          {columns.slice(1).map((col) => (
            <FormControlLabel
              key={col.field}
              control={
                <Checkbox
                  checked={selectedFields.includes(col.field)}
                  onChange={() => handleCheckboxChange(col.field)}
                />
              }
              label={col.headerName}
            />
          ))}
        </FormGroup>
      </div>
    </div>
  );
};

export default ChartDisplay;
