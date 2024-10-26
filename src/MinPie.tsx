import React, { useState, useEffect } from "react";
import { PieChart } from "@mui/x-charts/PieChart";
import { Checkbox, FormControlLabel, FormGroup } from "@mui/material";

interface MinPieChartProps {
  rows: any[];
  columns: any[];
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#AF19FF"];

const MinPie: React.FC<MinPieChartProps> = ({ rows, columns }) => {
  const [pieData, setPieData] = useState<{ name: string; value: number }[]>([]);
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [selectedDates, setSelectedDates] = useState<string[]>([]);

  useEffect(() => {
    extractMinData();
  }, [rows, columns]);

  // MIN列のデータを抽出し、選択可能な日付と円グラフ用データを整形
  const extractMinData = () => {
    // DATEとMIN列のフィールドを取得
    const dateField = columns[0].field;
    const minField = columns.find((col) => col.headerName === "MIN")?.field;

    if (!minField) return; // MIN列がない場合は終了

    const dates = rows.map((row) => row[dateField]);
    setAvailableDates(dates);
    setSelectedDates(dates); // 初期状態ですべて選択

    // 初期データとして全日付のデータを設定
    const initialPieData = rows.map((row) => ({
      name: row[dateField],
      value: (parseFloat(row[minField]) / 48) * 100, // 48分中の割合として計算
    }));
    setPieData(initialPieData);
  };

  // チェックボックスの変更を処理して選択日付を更新
  const handleCheckboxChange = (date: string) => {
    setSelectedDates((prevSelectedDates) =>
      prevSelectedDates.includes(date)
        ? prevSelectedDates.filter((d) => d !== date)
        : [...prevSelectedDates, date]
    );
  };

  // 円グラフのデータを選択日付に基づいてフィルタリング
  const filteredPieData = pieData.filter((data) =>
    selectedDates.includes(data.name)
  );

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
                checked={selectedDates.includes(date)}
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
            data: filteredPieData.map((data, index) => ({
              value: data.value,
              color: COLORS[index % COLORS.length],
              label: `${data.name}: ${data.value.toFixed(1)}%`,
            })),
          },
        ]}
      />
    </div>
  );
};

export default MinPie;
