import React, { useState } from "react";
import { BarChart } from "@mui/x-charts/BarChart";
import { Checkbox, FormControlLabel } from "@mui/material";
import dayjs from "dayjs";

interface ChartDisplayProps {
  rows: any[];
  columns: any[];
}

const ChartDisplay: React.FC<ChartDisplayProps> = ({ rows, columns }) => {
  // 表示対象のフィールドと日本語ラベルを対応付け
  const fieldLabels: { [key: string]: string } = {
    MIN: "出場時間",
    PTS: "得点数",
    REB: "リバウンド数",
    AST: "アシスト数",
    STL: "スティール数",
    "3P": "三ポイント数",
    FT: "フリースロー数",
    TO: "ターンオーバー数",
  };

  // 初期選択フィールド
  const [selectedFields, setSelectedFields] = useState<string[]>(["PTS"]);

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

  // ソートしたrowsのDATEをフォーマットしてラベルに使用
  const labels = sortedRows.map((row) =>
    dayjs(row[columns[0].field]).format("YYYY/MM/DD")
  );

  // チェックされているフィールドに基づいてデータを準備
  const dataset = selectedFields.map((field) => {
    const dataValues = sortedRows.map((row) => parseFloat(row[field]) || 0); // 数値に変換してデータを取得

    // 選択フィールドの平均値を計算
    const averageValue =
      dataValues.reduce((acc, val) => acc + val, 0) / dataValues.length;

    return {
      data: [...dataValues, averageValue], // 平均値を最後に追加
      label: fieldLabels[field] || field, // ラベルに日本語を使用
    };
  });

  return (
    <div style={{ display: "flex", alignItems: "flex-start" }}>
      {/* Flexboxで横並びに */}
      <div style={{ flex: 1 }}>
        {/* グラフの領域 */}
        <BarChart
          xAxis={[
            {
              data: [...labels, "平均"], // 最後に平均値のラベルを追加
              scaleType: "band",
              labelRotation: -45, // 日付を斜めに表示して、すべての日付を表示
              tickCount: labels.length + 1, // すべての日付を表示するためにラベル数を設定
            },
          ]}
          series={dataset} // 選択されたデータを表示
          width={800} // グラフの幅を指定
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
        {/* フィルタ対象フィールドのみチェックボックスを表示 */}
        {columns
          .filter((col) => Object.keys(fieldLabels).includes(col.field))
          .map((col) => (
            <FormControlLabel
              key={col.field}
              control={
                <Checkbox
                  checked={selectedFields.includes(col.field)}
                  onChange={() => handleCheckboxChange(col.field)}
                />
              }
              label={fieldLabels[col.field] || col.headerName} // 日本語ラベルを使用
            />
          ))}
      </div>
    </div>
  );
};

export default ChartDisplay;
