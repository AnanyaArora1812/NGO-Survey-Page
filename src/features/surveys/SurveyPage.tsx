import React, { useState, useRef, useEffect } from "react";
import {
  Input,
  Select,
  Button,
  Typography,
  Space,
  Badge,
  Statistic,
  Row,
  Col,
  Alert,
  Tooltip,
} from "antd";
import {
  SearchOutlined,
  ReloadOutlined,
  FileTextOutlined,
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  AlertOutlined,
} from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { useDebounce } from "use-debounce";
import anime from "animejs";

import { fetchSurveys } from "../../services/surveyApi";
import {
  SurveyListParams,
  SurveyStatus,
  SurveyPriority,
  IssueCategory,
  SurveyListResponse,
} from "../../types/survey.types";
import {
  STATUS_OPTIONS,
  PRIORITY_OPTIONS,
  CATEGORY_OPTIONS,
} from "./surveyUtils";
import SurveyTable from "./SurveyTable";
import SurveyModal from "./SurveyModal";

const { Title, Text } = Typography;

const SurveyPage: React.FC = () => {
  const headerRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<HTMLDivElement>(null);

  const [searchRaw, setSearchRaw] = useState("");
  const [search] = useDebounce(searchRaw, 400);
  const [status, setStatus] = useState<SurveyStatus | "">("");
  const [priority, setPriority] = useState<SurveyPriority | "">("");
  const [issueCategory, setIssueCategory] = useState<IssueCategory | "">("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [selectedSurveyId, setSelectedSurveyId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const queryParams: SurveyListParams = {
    page,
    pageSize,
    ...(search && { search }),
    ...(status && { status }),
    ...(priority && { priority }),
    ...(issueCategory && { issueCategory }),
  };

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery<SurveyListResponse, Error>({
    queryKey: ["surveys", queryParams],
    queryFn: () => fetchSurveys(queryParams),
    placeholderData: (prev) => prev,
    staleTime: 30_000,
  });

  useEffect(() => {
    setPage(1);
  }, [search, status, priority, issueCategory]);

  useEffect(() => {
    const tl = anime.timeline({ easing: "easeOutCubic" });
    if (headerRef.current) {
      tl.add({
        targets: headerRef.current,
        opacity: [0, 1],
        translateY: [-20, 0],
        duration: 500,
      });
    }
    if (statsRef.current) {
      tl.add(
        {
          targets: statsRef.current.querySelectorAll(".stat-card"),
          opacity: [0, 1],
          translateY: [20, 0],
          scale: [0.96, 1],
          duration: 400,
          delay: anime.stagger(80),
        },
        "-=200"
      );
    }
    if (controlsRef.current) {
      tl.add(
        {
          targets: controlsRef.current,
          opacity: [0, 1],
          translateY: [10, 0],
          duration: 350,
        },
        "-=150"
      );
    }
  }, []);

  const handleViewDetail = (id: string) => {
    setSelectedSurveyId(id);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedSurveyId(null);
  };

  const handleClearFilters = () => {
    setSearchRaw("");
    setStatus("");
    setPriority("");
    setIssueCategory("");
    setPage(1);
  };

  const hasActiveFilters = !!(searchRaw || status || priority || issueCategory);

  const surveys = data?.data ?? [];
  const totalSurveys = data?.total ?? 0;
  const pendingCount = surveys.filter((s) => s.status === SurveyStatus.PENDING).length;
  const criticalCount = surveys.filter(
    (s) => s.status === SurveyStatus.CRITICAL || s.priority === "CRITICAL"
  ).length;
  const completedCount = surveys.filter((s) => s.status === SurveyStatus.COMPLETED).length;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#080d12",
        padding: "28px 32px",
        fontFamily: "'IBM Plex Sans', 'Segoe UI', sans-serif",
      }}
    >
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background:
            "radial-gradient(ellipse 60% 40% at 50% -10%, rgba(24,144,255,0.07) 0%, transparent 70%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      <div style={{ position: "relative", zIndex: 1 }}>
        <div ref={headerRef} style={{ opacity: 0, marginBottom: 28 }}>
          <Space align="start" style={{ width: "100%", justifyContent: "space-between" }}>
            <div>
              <Space align="center" style={{ marginBottom: 6 }}>
                <div
                  style={{
                    width: 4,
                    height: 28,
                    background: "linear-gradient(180deg, #1890ff, #0050b3)",
                    borderRadius: 2,
                  }}
                />
                <Title
                  level={3}
                  style={{ color: "#e8f4fd", margin: 0, letterSpacing: "-0.3px", fontWeight: 600 }}
                >
                  Survey Management
                </Title>
              </Space>
              <Text style={{ color: "#4a7a9b", fontSize: 13, marginLeft: 12 }}>
                Monitor and manage field survey submissions from volunteers
              </Text>
            </div>
            <Space>
              <Tooltip title="Refresh data">
                <Button
                  icon={<ReloadOutlined spin={isFetching} />}
                  onClick={() => refetch()}
                  style={{
                    background: "#0d1f2d",
                    border: "1px solid #1e3a5f",
                    color: "#4a9eff",
                    borderRadius: 8,
                  }}
                />
              </Tooltip>
            </Space>
          </Space>
        </div>

        {isError && (
          <Alert
            type="error"
            message="Failed to fetch surveys"
            description={(error as Error)?.message}
            showIcon
            closable
            style={{ marginBottom: 20, borderRadius: 8 }}
          />
        )}

        <div ref={statsRef} style={{ marginBottom: 24 }}>
          <Row gutter={16}>
            {[
              {
                label: "Total Surveys",
                value: totalSurveys,
                icon: <FileTextOutlined />,
                color: "#1890ff",
                bg: "#0d1f2d",
                border: "#1e3a5f",
              },
              {
                label: "Pending Review",
                value: pendingCount,
                icon: <ClockCircleOutlined />,
                color: "#faad14",
                bg: "#1a1400",
                border: "#3d2e00",
              },
              {
                label: "Critical Cases",
                value: criticalCount,
                icon: <AlertOutlined />,
                color: "#ff4d4f",
                bg: "#1a0000",
                border: "#3d0000",
              },
              {
                label: "Completed",
                value: completedCount,
                icon: <CheckCircleOutlined />,
                color: "#52c41a",
                bg: "#0d1a00",
                border: "#1a3300",
              },
            ].map((stat) => (
              <Col span={6} key={stat.label}>
                <div
                  className="stat-card"
                  style={{
                    opacity: 0,
                    background: stat.bg,
                    border: `1px solid ${stat.border}`,
                    borderRadius: 10,
                    padding: "16px 20px",
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    cursor: "default",
                    transition: "border-color 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLDivElement).style.borderColor = stat.color + "60";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLDivElement).style.borderColor = stat.border;
                  }}
                >
                  <div
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: 10,
                      background: stat.color + "18",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 18,
                      color: stat.color,
                      flexShrink: 0,
                    }}
                  >
                    {stat.icon}
                  </div>
                  <Statistic
                    title={
                      <span style={{ color: "#4a7a9b", fontSize: 11, letterSpacing: "0.5px" }}>
                        {stat.label.toUpperCase()}
                      </span>
                    }
                    value={stat.value}
                    valueStyle={{ color: stat.color, fontSize: 22, fontWeight: 600 }}
                  />
                </div>
              </Col>
            ))}
          </Row>
        </div>

        <div
          ref={controlsRef}
          style={{
            opacity: 0,
            background: "#0a1520",
            border: "1px solid #1e2d3d",
            borderRadius: 10,
            padding: "16px 20px",
            marginBottom: 20,
          }}
        >
          <Row gutter={[12, 12]} align="middle">
            <Col flex="1 1 220px">
              <Input
                prefix={<SearchOutlined style={{ color: "#3d6080" }} />}
                placeholder="Search by ID, name, location..."
                value={searchRaw}
                onChange={(e) => setSearchRaw(e.target.value)}
                allowClear
                style={{
                  background: "#0d1f2d",
                  border: "1px solid #1e3a5f",
                  borderRadius: 8,
                  color: "#c8dff0",
                }}
              />
            </Col>
            <Col flex="0 1 160px">
              <Select
                placeholder="Filter Status"
                style={{ width: "100%" }}
                value={status || undefined}
                onChange={(val) => setStatus(val ?? "")}
                allowClear
                options={STATUS_OPTIONS}
              />
            </Col>
            <Col flex="0 1 160px">
              <Select
                placeholder="Filter Priority"
                style={{ width: "100%" }}
                value={priority || undefined}
                onChange={(val) => setPriority(val ?? "")}
                allowClear
                options={PRIORITY_OPTIONS}
              />
            </Col>
            <Col flex="0 1 190px">
              <Select
                placeholder="Filter Category"
                style={{ width: "100%" }}
                value={issueCategory || undefined}
                onChange={(val) => setIssueCategory(val ?? "")}
                allowClear
                options={CATEGORY_OPTIONS}
              />
            </Col>
            {hasActiveFilters && (
              <Col flex="0 0 auto">
                <Button
                  type="text"
                  onClick={handleClearFilters}
                  style={{
                    color: "#ff7875",
                    border: "1px solid #3d1a1a",
                    borderRadius: 8,
                    background: "#1a0000",
                  }}
                >
                  Clear Filters
                </Button>
              </Col>
            )}
            <Col flex="0 0 auto" style={{ marginLeft: "auto" }}>
              {hasActiveFilters && (
                <Badge
                  count={[searchRaw, status, priority, issueCategory].filter(Boolean).length}
                  style={{ background: "#1890ff" }}
                >
                  <Text style={{ color: "#4a7a9b", fontSize: 12 }}>Active filters</Text>
                </Badge>
              )}
            </Col>
          </Row>
        </div>

        <div
          style={{
            background: "#0a1520",
            border: "1px solid #1e2d3d",
            borderRadius: 10,
            overflow: "hidden",
          }}
        >
          <SurveyTable
            data={surveys}
            loading={isLoading || isFetching}
            total={totalSurveys}
            currentPage={page}
            pageSize={pageSize}
            onPageChange={(p, ps) => {
              setPage(p);
              setPageSize(ps);
            }}
            onViewDetail={handleViewDetail}
          />
        </div>

        <SurveyModal
          surveyId={selectedSurveyId}
          open={modalOpen}
          onClose={handleCloseModal}
        />
      </div>

      <style>{`
        .ant-table {
          background: transparent !important;
          color: #c8dff0 !important;
        }
        .ant-table-thead > tr > th {
          background: #091525 !important;
          border-bottom: 1px solid #1e2d3d !important;
          color: #4a7a9b !important;
          font-size: 11px !important;
          letter-spacing: 0.8px !important;
          text-transform: uppercase !important;
          font-weight: 600 !important;
        }
        .ant-table-tbody > tr > td {
          background: transparent !important;
          border-bottom: 1px solid #111e2b !important;
          padding: 12px 16px !important;
        }
        .ant-table-tbody > tr:hover > td {
          background: #0d1f2d !important;
        }
        .ant-table-tbody > tr.critical-row > td {
          background: #150505 !important;
        }
        .ant-table-tbody > tr.critical-row:hover > td {
          background: #1a0808 !important;
        }
        .ant-pagination {
          padding: 12px 16px !important;
        }
        .ant-pagination .ant-pagination-item,
        .ant-pagination .ant-pagination-prev,
        .ant-pagination .ant-pagination-next {
          background: #0d1f2d !important;
          border-color: #1e3a5f !important;
        }
        .ant-pagination .ant-pagination-item a,
        .ant-pagination .ant-pagination-prev button,
        .ant-pagination .ant-pagination-next button {
          color: #4a9eff !important;
        }
        .ant-pagination .ant-pagination-item-active {
          background: #1890ff !important;
          border-color: #1890ff !important;
        }
        .ant-pagination .ant-pagination-item-active a {
          color: white !important;
        }
        .ant-select .ant-select-selector {
          background: #0d1f2d !important;
          border-color: #1e3a5f !important;
          color: #c8dff0 !important;
          border-radius: 8px !important;
        }
        .ant-select-arrow {
          color: #4a7a9b !important;
        }
        .ant-input {
          background: #0d1f2d !important;
          border-color: #1e3a5f !important;
          color: #c8dff0 !important;
        }
        .ant-input::placeholder {
          color: #3d6080 !important;
        }
        .ant-select-dropdown {
          background: #0f1a26 !important;
          border: 1px solid #1e3a5f !important;
          border-radius: 8px !important;
        }
        .ant-select-item {
          color: #c8dff0 !important;
        }
        .ant-select-item-option-active,
        .ant-select-item-option-selected {
          background: #0d2137 !important;
        }
        .ant-statistic-title {
          color: #4a7a9b !important;
        }
        .ant-spin-dot-item {
          background: #1890ff !important;
        }
        .ant-modal-confirm-content {
          color: #c8dff0 !important;
        }
      `}</style>
    </div>
  );
};

export default SurveyPage;
