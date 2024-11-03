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

  // OPFSにファイルを保存する関数
  const saveToOPFS = async (fileName: string, content: string) => {
    try {
      // OPFSのルートディレクトリを取得
      const rootDir = await navigator.storage.getDirectory();
      // 新しいファイルを作成
      const fileHandle = await rootDir.getFileHandle(fileName, {
        create: true,
      });
      // 書き込みストリームを開く
      const writable = await fileHandle.createWritable();
      // コンテンツを書き込む
      await writable.write(content);
      // ストリームを閉じて保存を完了
      await writable.close();
      console.log("OPFSにファイルが保存されました:", fileName);
    } catch (error) {
      console.error("OPFSにファイルを保存中にエラーが発生しました:", error);
    }
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);

    const reader = new FileReader();
    reader.onload = async (e) => {
      const csvData = e.target?.result as string;

      // OPFSにファイルを保存
      await saveToOPFS("uploaded_data.csv", csvData);

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
        //データベース接続
        const conn = await db.connect();
        //メモリ上にdata.csvの名前で登録後、テーブルへ挿入
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

        const formattedRows = originalRows.map((row, index) => ({
          id: index, // 各行に一意のIDを設定
          ...row,
          DATE: dayjs(row.DATE, "YYYY/MM/DD").toDate(),
        }));

        const columns = originalResult.schema.fields.map((field) => ({
          field: field.name,
          headerName: field.name,
          width: 150,
          type: field.name === "DATE" ? "date" : "string",
        }));

        onDataLoaded(formattedRows, columns);

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
