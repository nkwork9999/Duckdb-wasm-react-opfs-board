import React, { useState } from "react";
import { motion } from "framer-motion";
import { Tabs, Tab, Typography, Box, Button } from "@mui/material";
import CsvUpload from "./CsvUpload.tsx";
import CsvLoadFromOpfs from "./Csvloadfromopfs.tsx";
import ChartDisplay from "./ChartDisplay.tsx";
import DataGridDisplay from "./DataGrid.tsx";
import MinPie from "./MinPie.tsx";
import BoxPlot from "./boxplot.tsx";

const App: React.FC = () => {
  const [rows, setRows] = useState<any[]>([]);
  const [columns, setColumns] = useState<any[]>([]);
  const [selectedTab, setSelectedTab] = useState(0);

  const handleDataLoaded = (newRows: any[], newColumns: any[]) => {
    setRows(newRows);
    setColumns(newColumns);
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

  return (
    <div style={{ padding: "20px", maxWidth: "90vw", margin: "0 auto" }}>
      {/* CSV Upload section */}
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        marginBottom={4}
        component={motion.div}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <CsvUpload onDataLoaded={handleDataLoaded} />
        </motion.div>
      </Box>

      {/* OPFS Load section */}
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        marginBottom={4}
        component={motion.div}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <CsvLoadFromOpfs onDataLoaded={handleDataLoaded} />
        </motion.div>
      </Box>

      {/* Tabs and content as in previous example */}
      {rows.length > 0 && columns.length > 0 && (
        <>
          <Tabs
            value={selectedTab}
            onChange={handleTabChange}
            centered
            style={{ marginBottom: "20px" }}
          >
            <Tab label="DataGrid 表示" />
            <Tab label="Barチャート" />
            <Tab label="MinPie" />
            <Tab label="BoxPlot" />
          </Tabs>

          <Box style={{ padding: "20px", border: "1px solid #ccc" }}>
            {selectedTab === 0 && (
              <DataGridDisplay rows={rows} columns={columns} />
            )}
            {selectedTab === 1 && (
              <ChartDisplay rows={rows} columns={columns} />
            )}
            {selectedTab === 2 && <MinPie rows={rows} columns={columns} />}
            {selectedTab === 3 && <BoxPlot />}
          </Box>
        </>
      )}
    </div>
  );
};

export default App;
