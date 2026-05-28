import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ConfigProvider, theme } from "antd";

import queryClient from "./services/queryClient";
import SurveyPage from "./features/surveys/SurveyPage";

const antThemeConfig = {
  algorithm: theme.darkAlgorithm,
  token: {
    colorPrimary: "#1890ff",
    colorBgBase: "#080d12",
    colorBgContainer: "#0a1520",
    colorBgElevated: "#0f1a26",
    colorBorder: "#1e2d3d",
    colorText: "#c8dff0",
    colorTextSecondary: "#4a7a9b",
    borderRadius: 8,
    fontFamily: "'IBM Plex Sans', 'Segoe UI', sans-serif",
  },
};

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ConfigProvider theme={antThemeConfig}>
        <SurveyPage />
      </ConfigProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </React.StrictMode>
);
