import React, { useState } from "react";
import * as duckdb from "@duckdb/duckdb-wasm";
import dayjs from "dayjs"; // dayjsライブラリをインポート

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

        // CSVを登録し、テーブルを作成
        await db.registerFileText("data.csv", csvData);
        await conn.insertCSVFromPath("data.csv", {
          schema: "main",
          name: "foo",
          detect: true,
          header: true,
          delimiter: ",",
        });

        // 元のデータを取得
        const originalResult = await conn.query(`
          SELECT * FROM foo;
        `);

        const originalRows = originalResult.toArray();

        // DATE列を日付型に変換（dayjsでパース）
        const formattedRows = originalRows.map((row) => ({
          ...row,
          DATE: dayjs(row.DATE, "YYYY/MM/DD").toDate(), // 日付フォーマットに従って変換
        }));

        // 平均値を計算するSQLクエリを実行
        const averageResult = await conn.query(`
          SELECT 
            '平均' as DATE,
            '' as OPP,
            '' as SCORE,
            AVG(MIN) AS MIN, 
            AVG(PTS) AS PTS, 
            AVG(REB) AS REB, 
            AVG(AST) AS AST,
            AVG(STL) AS STL,
            AVG(BLK) AS BLK,
            AVG(FG) AS FG,
            AVG("FG%") AS "FG%",
            AVG("3P") AS "3P",
            AVG("3P%") AS "3P%",
            AVG(FT) AS FT,
            AVG("FT%") AS "FT%",
            AVG(OREB) AS OREB,
            AVG(DREB) AS DREB,
            AVG(TO) AS TO,
            AVG(PF) AS PF,
            AVG(EFF) AS EFF,
            AVG("+/-") AS "+/-"
          FROM foo;
        `);

        const averageRow = averageResult.toArray()[0]; // 平均値の行を取得
        averageRow.DATE = "平均"; // 平均行のDATEを文字列にセット

        // 平均値を最後の行として追加したデータを作成
        const allRows = [...formattedRows, averageRow];

        // カラム定義を生成
        const columns = originalResult.schema.fields.map((field) => ({
          field: field.name,
          headerName: field.name,
          width: 150,
          type: field.name === "DATE" ? "date" : "string", // DATE列を日付型に設定
        }));

        // onDataLoadedで元のデータと平均値を一緒に渡す
        onDataLoaded(allRows, columns);

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
