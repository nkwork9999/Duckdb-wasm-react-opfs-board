import React, { useState } from "react";
import * as duckdb from "@duckdb/duckdb-wasm";

interface CsvUploadProps {
  onDataLoaded: (rows: any[], columns: any[]) => void; // データを渡すためのコールバック
}

const CsvUpload: React.FC<CsvUploadProps> = ({ onDataLoaded }) => {
  const [loading, setLoading] = useState<boolean>(false);

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);

    const reader = new FileReader();
    reader.onload = async (e) => {
      const csvData = e.target?.result as string;

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

        await db.registerFileText("data.csv", csvData);
        await conn.insertCSVFromPath("data.csv", {
          schema: "main",
          name: "foo",
          detect: true,
          header: true,
          delimiter: ",",
        });

        const result = await conn.query("SELECT * FROM foo;");
        const data = result.toArray();
        const columns = result.schema.fields.map((field) => ({
          field: field.name,
          headerName: field.name,
          width: 150,
        }));

        onDataLoaded(data, columns); // データを渡す
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
    <div>
      <input type="file" accept=".csv" onChange={handleFileUpload} />
      {loading && <p>データを処理中...</p>}
    </div>
  );
};

export default CsvUpload;
