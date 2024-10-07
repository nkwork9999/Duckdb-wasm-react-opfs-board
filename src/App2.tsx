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
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);

    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target?.result as string;

      const JSDELIVR_BUNDLES = duckdb.getJsDelivrBundles();
      const bundle = await duckdb.selectBundle(JSDELIVR_BUNDLES);

      const worker_url = URL.createObjectURL(
        new Blob([`importScripts("${bundle.mainWorker!}");`], {
          type: "text/javascript",
        })
      );

      const worker = new Worker(worker_url);
      const logger = new duckdb.ConsoleLogger();
      const db = new duckdb.AsyncDuckDB(logger, worker);
      await db.instantiate(bundle.mainModule, bundle.pthreadWorker);
      URL.revokeObjectURL(worker_url);

      try {
        const conn = await db.connect();

        // CSVデータをDuckDBのテーブルに読み込む
        await conn.query(`
          CREATE TABLE csv_data AS 
          SELECT * FROM read_csv_auto('${text}');
        `);

        // データを取得
        const result = await conn.query("SELECT * FROM csv_data;");
        const data = result.toArray();

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

        setLoading(false);
        await conn.close();
      } catch (error) {
        console.error("CSVファイルの読み込みエラー:", error);
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
