import React, { useState, useRef } from "react";
import * as duckdb from "@duckdb/duckdb-wasm";
import dayjs from "dayjs";
import { Button, Typography, Box, CircularProgress } from "@mui/material";

interface CsvUploadProps {
  onDataLoaded: (rows: any[], columns: any[]) => void;
}

const CsvUpload: React.FC<CsvUploadProps> = ({ onDataLoaded }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null); // Ref for hidden input

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);

    //ファイルリーダーで単純にCSVを読む
    //読み込み後onloadが走る
    //ファイル内容がテキストとして格納
    const reader = new FileReader();
    reader.onload = async (e) => {
      const csvData = e.target?.result as string;

      //初回時はバンドルリストを取得するためオンラインである必要性がある
      //javascriptはduckdbを実行するために必要

      const JSDELIVR_BUNDLES = duckdb.getJsDelivrBundles();
      const bundle = await duckdb.selectBundle(JSDELIVR_BUNDLES);

      //一時的にwebworkerとして使用するjavascriptコードにアクセスするためのurlを生成

      const worker_url = URL.createObjectURL(
        new Blob([`importScripts("${bundle.mainWorker!}");`], {
          type: "text/javascript",
        })
      );
      //web workerでバックグラウンドでデータベース処理を行う環境を作る。
      //ブラウザがメインスレッドなのでそれを妨げないようにデータベース処理を行う
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

        const originalResult = await conn.query(`SELECT * FROM foo;`);
        const originalRows = originalResult.toArray();

        const formattedRows = originalRows.map((row) => ({
          ...row,
          DATE: dayjs(row.DATE, "YYYY/MM/DD").toDate(),
        }));

        const averageResult = await conn.query(`
          SELECT '平均' as DATE, '' as OPP, '' as SCORE,
            AVG(MIN) AS MIN, AVG(PTS) AS PTS, AVG(REB) AS REB, 
            AVG(AST) AS AST, AVG(STL) AS STL, AVG(BLK) AS BLK, 
            AVG(FG) AS FG, AVG("FG%") AS "FG%", AVG("3P") AS "3P", 
            AVG("3P%") AS "3P%", AVG(FT) AS FT, AVG("FT%") AS "FT%", 
            AVG(OREB) AS OREB, AVG(DREB) AS DREB, AVG(TO) AS TO, 
            AVG(PF) AS PF, AVG(EFF) AS EFF, AVG("+/-") AS "+/-"
          FROM foo;
        `);

        const averageRow = averageResult.toArray()[0];
        averageRow.DATE = "平均";
        const allRows = [...formattedRows, averageRow];

        const columns = originalResult.schema.fields.map((field) => ({
          field: field.name,
          headerName: field.name,
          width: 150,
          type: field.name === "DATE" ? "date" : "string",
        }));

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

  const handleButtonClick = () => {
    fileInputRef.current?.click(); // Trigger hidden file input
  };

  return (
    <Box>
      <Typography variant="h5" component="h3" gutterBottom>
        CSVファイルを選択
      </Typography>
      <Button variant="contained" color="primary" onClick={handleButtonClick}>
        CSVファイルを選択
      </Button>
      <input
        type="file"
        accept=".csv"
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={handleFileUpload}
      />

      {loading && (
        <Box display="flex" alignItems="center" gap={1} mt={2}>
          <CircularProgress size={24} />
          <Typography>データを処理中...</Typography>
        </Box>
      )}
    </Box>
  );
};

export default CsvUpload;
