import React, { useState } from "react";
import * as duckdb from "@duckdb/duckdb-wasm";
import { DataGrid, GridColDef } from "@mui/x-data-grid";

export default function App() {
  const [loading, setLoading] = useState<boolean>(false);
  const [rows, setRows] = useState<any[]>([]);
  const [columns, setColumns] = useState<GridColDef[]>([]);

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    console.log("File upload triggered");
    const file = event.target.files?.[0];
    if (!file) {
      console.log("No file selected");
      return;
    }

    setLoading(true);
    console.log("File is loading...");

    const reader = new FileReader();
    reader.onload = async (e) => {
      console.log("File read successfully");
      const csvData = e.target?.result as string;

      // DuckDBバンドルの選択
      console.log("Selecting DuckDB bundle");
      const JSDELIVR_BUNDLES = duckdb.getJsDelivrBundles();
      const bundle = await duckdb.selectBundle(JSDELIVR_BUNDLES);

      // Workerの設定
      console.log("Setting up Worker");
      const worker_url = URL.createObjectURL(
        new Blob([`importScripts("${bundle.mainWorker!}");`], {
          type: "text/javascript",
        })
      );

      const worker = new Worker(worker_url);
      const logger = new duckdb.ConsoleLogger();
      const db = new duckdb.AsyncDuckDB(logger, worker);
      console.log("Initializing DuckDB instance");
      await db.instantiate(bundle.mainModule, bundle.pthreadWorker);
      URL.revokeObjectURL(worker_url);

      try {
        console.log("Connecting to DuckDB");
        const conn = await db.connect();

        // メモリに直接CSVを読み込むには、データをテーブルにインポートする必要があります
        const tableName = "csv_data";
        await conn.query(`
          CREATE TABLE ${tableName} AS 
          SELECT * FROM read_csv_auto('dummy.csv', data='${csvData.replace(
            /'/g,
            "''"
          )}');
        `);

        // データ取得
        console.log("Executing query to read CSV data");
        const result = await conn.query(`SELECT * FROM ${tableName};`);
        const data = result.toArray();
        console.log("Data fetched:", data);

        // 列名を取得
        const columnNames = result.schema.fields.map((field) => ({
          field: field.name,
          headerName: field.name,
          width: 150,
        }));
        setColumns(columnNames);

        // 行データを作成
        const rowData = data.map((row, index) => ({
          id: index,
          ...row,
        }));
        setRows(rowData);

        console.log("DataGrid rows and columns set");

        setLoading(false);
        await conn.close();
      } catch (error) {
        // エラーの詳細をコンソールに出力
        console.error("CSVファイルの読み込みエラー:", error.message);
        console.error("Error details:", error);
        setLoading(false);
      }
    };

    reader.readAsText(file);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">
        DuckDB - CSVをParquetに変換して表示
      </h1>
      <input type="file" accept=".csv" onChange={handleFileUpload} />
      {loading ? (
        <p>データを処理中...</p>
      ) : (
        <div style={{ height: 400, width: "100%" }}>
          <DataGrid rows={rows} columns={columns} />
        </div>
      )}
    </div>
  );
}
