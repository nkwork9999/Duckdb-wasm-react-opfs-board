import React from "react";
import { DataGrid } from "@mui/x-data-grid";
import { GridColDef } from "@mui/x-data-grid";

interface DataGridDisplayProps {
  rows: any[];
  columns: GridColDef[];
}

const DataGridDisplay: React.FC<DataGridDisplayProps> = ({ rows, columns }) => {
  return (
    <div style={{ height: 400, width: "100%" }}>
      <DataGrid
        rows={rows}
        columns={columns}
        getRowId={(row) => {
          // 「年月」がない場合に備えて、インデックスをIDとして利用
          return row["年月"] || Math.random().toString(36).substr(2, 9);
        }}
      />
    </div>
  );
};

export default DataGridDisplay;
