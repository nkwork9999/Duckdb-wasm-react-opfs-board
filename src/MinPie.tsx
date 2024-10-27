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

  // 選択された日付に基づいて MIN 列のデータを抽出し、48分中の割合で円グラフ用データを作成
  const pieChartData = () => {
    const minField = columns.find((col) => col.headerName === "MIN")?.field;
    const dateField = columns[0].field;

    const row = rows.find((r) => r[dateField] === selectedDate);
    const minValue = row && minField ? parseFloat(row[minField]) || 0 : 0;

    return [
      {
        value: (minValue / 48) * 100,
        color: COLORS[0],
        label: `出場時間: ${minValue.toFixed(1)}分`, // 実際の出場時間をラベルに表示
      },
      {
        value: ((48 - minValue) / 48) * 100,
        color: COLORS[1],
        label: `残り時間: ${(((48 - minValue) / 48) * 100).toFixed(1)}%`, // 48分中の残り時間割合を表示
      },
    ];
  };

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
      <PieChart
        width={400}
        height={400}
        series={[
          {
            data: pieChartData(),
          },
        ]}
      />
    </div>
  );
};

export default MinPie;
