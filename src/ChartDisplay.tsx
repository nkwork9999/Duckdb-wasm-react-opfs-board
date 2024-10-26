import React, { useState, useEffect } from "react";
import { BarChart } from "@mui/x-charts/BarChart";
import { Checkbox, FormControlLabel } from "@mui/material";

interface ChartDisplayProps {
  rows: any[];
  columns: any[];
}

const ChartDisplay: React.FC<ChartDisplayProps> = ({ rows, columns }) => {
  const [selectedFields, setSelectedFields] = useState<string[]>([
    columns[1].field,
  ]);

  // rowsをDATE順にソート（降順）して、新しい日付が右に来るようにする
  const sortedRows = [...rows].sort(
    (a, b) =>
      new Date(a[columns[0].field]).getTime() -
      new Date(b[columns[0].field]).getTime()
  );

  // チェックボックスの変更をハンドリングする関数
  const handleCheckboxChange = (field: string) => {
    setSelectedFields((prevFields) =>
      prevFields.includes(field)
        ? prevFields.filter((f) => f !== field)
        : [...prevFields, field]
    );
  };

  const labels = sortedRows.map((row) => row[columns[0].field]); // ソートしたrowsのDATEをラベルに使用

  // チェックされているフィールドに基づいてデータを準備
  const dataset = selectedFields.map((field) => ({
    data: sortedRows.map((row) => parseFloat(row[field]) || 0), // 数値に変換してデータを取得
    label: columns.find((col) => col.field === field)?.headerName || field,
  }));

  return (
    <div style={{ display: "flex", alignItems: "flex-start" }}>
      {/* Flexboxで横並びに */}
      <div style={{ flex: 1 }}>
        {/* グラフの領域 */}
        <BarChart
          xAxis={[
            {
              data: labels, // x軸にソートされた日付ラベルをセット
              scaleType: "band",
              labelRotation: -45, // 日付を斜めに表示して、すべての日付を表示
              tickCount: labels.length, // すべての日付を表示するためにラベル数を設定
            },
          ]}
          series={dataset} // 選択されたデータを表示
          width={600} // グラフの幅を指定
          height={400} // グラフの高さを指定
        />
      </div>

      <div
        style={{
          marginLeft: "20px",
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "10px",
        }}
      >
        {/* チェックボックスの領域を3列で表示 */}
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
      </div>
    </div>
  );
};

export default ChartDisplay;
