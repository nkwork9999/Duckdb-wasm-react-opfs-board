import React, { useState, useEffect } from "react";
import {
  Button,
  Typography,
  Box,
  CircularProgress,
  List,
  ListItem,
  Alert,
} from "@mui/material";
import { motion } from "framer-motion";

interface CsvLoadFromOpfsProps {
  onDataLoaded: (rows: any[], columns: any[]) => void;
}

const CsvLoadFromOpfs: React.FC<CsvLoadFromOpfsProps> = ({ onDataLoaded }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [files, setFiles] = useState<FileSystemFileHandle[]>([]);

  useEffect(() => {
    loadOpfsFiles();
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

      setFiles(fileHandles);
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
    <Box>
      <Typography variant="h5" component="h3" gutterBottom>
        OPFSからCSVファイルを選択
      </Typography>

      {/* {error && (
        <Alert severity="error" style={{ marginTop: "10px" }}>
          {error}
        </Alert>
      )} */}

      <List style={{ maxWidth: "400px", marginTop: "10px" }}>
        {files.map((fileHandle) => (
          <ListItem key={fileHandle.name}>
            <motion.div whileHover={{ scale: 1.02 }}>
              <Button
                variant="outlined"
                color="primary"
                onClick={() => handleFileSelect(fileHandle)}
              >
                {fileHandle.name}
              </Button>
            </motion.div>
          </ListItem>
        ))}
      </List>

      {files.length === 0 && !loading && (
        <Typography variant="body2" color="textSecondary">
          利用可能なファイルがありません。
        </Typography>
      )}
    </Box>
  );
};

export default CsvLoadFromOpfs;
