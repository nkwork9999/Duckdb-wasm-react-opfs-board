import React, { useEffect } from "react";
import * as duckdb from "@duckdb/duckdb-wasm";

export default function App2() {
  useEffect(() => {
    const initDuckDB = async () => {
      const JSDELIVR_BUNDLES = duckdb.getJsDelivrBundles();

      // Select a bundle based on browser checks
      const bundle = await duckdb.selectBundle(JSDELIVR_BUNDLES);

      const worker_url = URL.createObjectURL(
        new Blob([`importScripts("${bundle.mainWorker!}");`], {
          type: "text/javascript",
        })
      );

      // Instantiate the asynchronous version of DuckDB-Wasm
      const worker = new Worker(worker_url);
      const logger = new duckdb.ConsoleLogger();
      const db = new duckdb.AsyncDuckDB(logger, worker);
      await db.instantiate(bundle.mainModule, bundle.pthreadWorker);
      URL.revokeObjectURL(worker_url);

      console.log("DuckDB initialized");
      try {
        const conn = await db.connect();

        // `fetch` を使ってファイルのデータを読み込み
        const response = await fetch("./0.jsonl");
        const jsonlData = await response.text();

        // `0.jsonl` の内容を仮想テーブルに取り込む
        await conn.query(`
          CREATE TABLE json_data AS 
          SELECT * FROM read_json_objects('${jsonlData}');
        `);

        // 取り込んだデータを確認するためのクエリを実行
        const result = await conn.query("SELECT * FROM json_data LIMIT 10;");
        console.log("JSONL Data:", result);

        await conn.close();
      } catch (error) {
        console.error("Error loading JSONL file:", error);
      }
    };

    // 非同期処理をuseEffect内で呼び出し
    initDuckDB();
  }, []);

  return <div>DuckDB App</div>;
}
