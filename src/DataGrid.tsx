import React from "react";
import { DataGrid, GridColDef } from "@mui/x-data-grid";

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
          // インデックスを使用して一意のIDを生成
          return row["DATE"] || Math.random().toString(36).substr(2, 9);
        }}
        pageSize={5}
        rowsPerPageOptions={[5, 10, 20]}
        checkboxSelection
        sortingOrder={["desc", "asc"]} // 昇順・降順の指定
      />
    </div>
  );
};

export default DataGridDisplay;
