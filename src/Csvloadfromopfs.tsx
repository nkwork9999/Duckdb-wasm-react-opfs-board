import React, { useState, useEffect } from "react";

interface CsvLoadFromOpfsProps {
  onDataLoaded: (rows: any[], columns: any[]) => void;
}

const CsvLoadFromOpfs: React.FC<CsvLoadFromOpfsProps> = ({ onDataLoaded }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [files, setFiles] = useState<FileSystemFileHandle[]>([]); // OPFS内のファイルリスト

  useEffect(() => {
    loadOpfsFiles(); // コンポーネントのマウント時にファイルをロード
  }, []);

  // OPFSからファイルリストをロードする関数
  const loadOpfsFiles = async () => {
    try {
      setLoading(true);
      const rootHandle = await navigator.storage.getDirectory();
      const fileHandles: FileSystemFileHandle[] = [];

      for await (const [name, handle] of rootHandle) {
        if (handle.kind === "file") {
          fileHandles.push(handle as FileSystemFileHandle);
        }
      }

      setFiles(fileHandles); // ファイルリストを保存
    } catch (err) {
      setError("OPFSからファイルを読み込む際にエラーが発生しました。");
    } finally {
      setLoading(false);
    }
  };

  // 選択されたCSVファイルを読み込む関数
  const handleFileSelect = async (fileHandle: FileSystemFileHandle) => {
    try {
      setLoading(true);
      setError(null);

      const file = await fileHandle.getFile();
      const fileContents = await file.text();

      // CSVファイルをパースしてデータを抽出
      parseCsv(fileContents);
    } catch (err: any) {
      setError(`ファイル読み込みエラー: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // CSVファイルの内容を解析してデータを渡す関数
  const parseCsv = (csvData: string) => {
    const rows = csvData.split("\n").map((row) => row.split(","));
    const columns = rows[0].map((header) => ({
      field: header,
      headerName: header,
      width: 150,
    }));

    const data = rows.slice(1).map((row) => {
      return row.reduce((acc, value, index) => {
        acc[columns[index].field] = value;
        return acc;
      }, {} as any);
    });

    onDataLoaded(data, columns);
  };

  return (
    <div>
      <h3>OPFSからCSVファイルを選択</h3>
      {loading && <p>データを読み込み中...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      <ul>
        {files.map((fileHandle) => (
          <li key={fileHandle.name}>
            <button onClick={() => handleFileSelect(fileHandle)}>
              {fileHandle.name}
            </button>
          </li>
        ))}
      </ul>

      {files.length === 0 && !loading && (
        <p>利用可能なファイルがありません。</p>
      )}
    </div>
  );
};

export default CsvLoadFromOpfs;
