import React, { useState } from "react";
import CsvUpload from "./CsvUpload.tsx";
import ChartDisplay from "./ChartDisplay.tsx";
import DataGridDisplay from "./DataGrid.tsx";
import { Responsive, WidthProvider } from "react-grid-layout"; // react-grid-layoutをインポート
import "react-grid-layout/css/styles.css"; // スタイルシートのインポート
import "react-resizable/css/styles.css"; // リサイズ用のスタイル
import CsvLoadFromOpfs from "./Csvloadfromopfs.tsx";

const ResponsiveGridLayout = WidthProvider(Responsive);

const App: React.FC = () => {
  const [rows, setRows] = useState<any[]>([]);
  const [columns, setColumns] = useState<any[]>([]);

  const handleDataLoaded = (newRows: any[], newColumns: any[]) => {
    setRows(newRows);
    setColumns(newColumns);
  };

  // レイアウト設定: x (左からの位置), y (上からの位置), w (幅), h (高さ)
  const layout = [
    { i: "chart", x: 0, y: 0, w: 6, h: 4 },
    { i: "dataGrid", x: 6, y: 0, w: 6, h: 4 },
  ];
  //棒グラフ重ね

  //土地比較
  //着色
  //ヒートマップ
  //移動平均
  //lock
  return (
    <div>
      <h1>CSVデータを読み込んで表示</h1>
      <CsvUpload onDataLoaded={handleDataLoaded} />
      <h1>CSVをOPFSから読み込んで表示</h1>
      <CsvLoadFromOpfs onDataLoaded={handleDataLoaded} />
      {rows.length > 0 && columns.length > 0 && (
        <ResponsiveGridLayout
          className="layout"
          layouts={{ lg: layout }} // レイアウトの設定
          breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }} // レスポンシブ設定
          cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }} // 各画面サイズでの列数
          rowHeight={30}
          isResizable={true} // リサイズを許可
          isDraggable={true} // ドラッグを許可
        >
          <div key="chart">
            <h2>Barチャート</h2>
            <ChartDisplay rows={rows} columns={columns} />
          </div>
          <div key="dataGrid">
            <h2>DataGrid 表示</h2>
            <DataGridDisplay rows={rows} columns={columns} />
          </div>
        </ResponsiveGridLayout>
      )}
    </div>
  );
};

export default App;
