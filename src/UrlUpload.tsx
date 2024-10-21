import React, { useState } from "react";
import * as duckdb from "@duckdb/duckdb-wasm";
import cheerio from "cheerio";

interface UrlUploadProps {
  onDataLoaded: (rows: any[], columns: any[]) => void; // データを渡すためのコールバック
}

const UrlUpload: React.FC<UrlUploadProps> = ({ onDataLoaded }) => {
  const [url, setUrl] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const handleFetchData = async () => {
    setLoading(true);

    try {
      // URLからHTMLを取得
      const response = await fetch(url);
      const html = await response.text();

      // cheerioを使ってHTMLをパース
      const $ = cheerio.load(html);

      // ターゲットテーブルを取得（例：1番目のテーブルを取得）
      const table = $("table#per_game"); // #per_game はターゲットテーブルのID

      // テーブルヘッダーを取得
      const headers: string[] = [];
      table.find("thead th").each((_, th) => {
        headers.push($(th).text().trim());
      });

      // テーブルボディを取得
      const rows: any[] = [];
      table.find("tbody tr").each((_, tr) => {
        const row: any = {};
        $(tr)
          .find("td")
          .each((index, td) => {
            row[headers[index]] = $(td).text().trim();
          });
        rows.push(row);
      });

      // DuckDBにデータをロードする
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

      const conn = await db.connect();

      await conn.insertCSVFromArray(headers, rows, {
        schema: "main",
        name: "table_data",
      });

      const result = await conn.query("SELECT * FROM table_data;");
      const data = result.toArray();
      const columns = headers.map((header) => ({
        field: header,
        headerName: header,
        width: 150,
      }));

      onDataLoaded(data, columns); // データを渡す
      await conn.close();
      setLoading(false);
    } catch (error) {
      console.error("URLからのデータ取得エラー:", error);
      setLoading(false);
    }
  };

  return (
    <div>
      <input
        type="text"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="URLを入力"
      />
      <button onClick={handleFetchData} disabled={loading}>
        データ取得
      </button>
      {loading && <p>データを処理中...</p>}
    </div>
  );
};

export default UrlUpload;
