import React, { useState, useEffect } from "react";
import { PieChart } from "@mui/x-charts/PieChart";
import { Checkbox, FormControlLabel, FormGroup } from "@mui/material";

interface MinPieChartProps {
  rows: any[];
  columns: any[];
}

const COLORS = ["#0088FE", "#FF8042"]; // 出場時間と残り時間の色

const MinPie: React.FC<MinPieChartProps> = ({ rows, columns }) => {
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>("");

  useEffect(() => {
    extractAvailableDates();
  }, [rows, columns]);

  // 日付のリストを設定し、初期状態ですべて選択
  const extractAvailableDates = () => {
    const dateField = columns[0].field;
    const dates = rows.map((row) => row[dateField]);
    setAvailableDates(dates);
    setSelectedDate(dates[0]); // 初期状態で最初の日付を選択
  };

  // チェックボックスの変更を処理し、選択された日付を更新
  const handleCheckboxChange = (date: string) => {
    setSelectedDate(date);
  };

  // 選択された日付に基づいて MIN 列のデータを抽出し、48分中の出場時間を表示
  const pieChartData = () => {
    const minField = columns.find((col) => col.headerName === "MIN")?.field;
    const dateField = columns[0].field;

    const row = rows.find((r) => r[dateField] === selectedDate);
    const minValue = row && minField ? parseFloat(row[minField]) || 0 : 0;

    return [
      {
        value: minValue, // 出場時間をそのまま使用
        color: COLORS[0],
      },
      {
        value: 48 - minValue, // 残り時間を48分から引いた値
        color: COLORS[1],
      },
    ];
  };

  const pieData = pieChartData();

  return (
    <div
      style={{ display: "flex", flexDirection: "column", alignItems: "center" }}
    >
      <h3>日付別のプレイ時間（48分中）</h3>
      <FormGroup row>
        {availableDates.map((date) => (
          <FormControlLabel
            key={date}
            control={
              <Checkbox
                checked={selectedDate === date}
                onChange={() => handleCheckboxChange(date)}
              />
            }
            label={date}
          />
        ))}
      </FormGroup>

      {/* グラフとラベルを配置するコンテナ */}
      <div style={{ position: "relative", width: "400px", height: "400px" }}>
        <PieChart
          width={400}
          height={400}
          series={[
            {
              data: pieData,
              label: { visible: false }, // ラベルを非表示に設定
            },
          ]}
        />

        {/* 出場時間ラベル（円グラフの上側に表示） */}
        <div
          style={{
            position: "absolute",
            top: "150px",
            left: "100%",
            transform: "translateX(-50%)",
            backgroundColor: COLORS[0],
            color: "white",
            padding: "4px 8px",
            borderRadius: "4px",
            fontSize: "14px",
            whiteSpace: "nowrap",
          }}
        >
          出場時間: {pieData[0].value.toFixed(1)}分
        </div>

        {/* 残り時間ラベル（円グラフの下側に表示） */}
        <div
          style={{
            position: "absolute",
            bottom: "150px",
            left: "100%",
            transform: "translateX(-50%)",
            backgroundColor: COLORS[1],
            color: "white",
            padding: "4px 8px",
            borderRadius: "4px",
            fontSize: "14px",
            whiteSpace: "nowrap",
          }}
        >
          残り時間: {pieData[1].value.toFixed(1)}分
        </div>
      </div>
    </div>
  );
};

export default MinPie;
