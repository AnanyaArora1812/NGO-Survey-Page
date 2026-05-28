import React, { useRef, useEffect } from "react";
import {
  Table,
  Tag,
  Button,
  Space,
  Tooltip,
  Select,
  Typography,
  Modal,
  Form,
  message,
} from "antd";
import type { ColumnsType, TablePaginationConfig } from "antd/es/table";
import {
  EyeOutlined,
  UserAddOutlined,
  EditOutlined,
  ThunderboltOutlined,
} from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import anime from "animejs";

import {
  Survey,
  SurveyStatus,
  SurveyPriority,
  VolunteerOption,
} from "../../types/survey.types";
import {
  STATUS_COLOR_MAP,
  PRIORITY_COLOR_MAP,
  STATUS_OPTIONS,
  formatCategory,
  formatDate,
} from "./surveyUtils";
import {
  updateSurveyStatus,
  assignVolunteer,
  fetchVolunteerOptions,
} from "../../services/surveyApi";

const { Text } = Typography;

interface SurveyTableProps {
  data: Survey[];
  loading: boolean;
  total: number;
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number, pageSize: number) => void;
  onViewDetail: (id: string) => void;
}

const SurveyTable: React.FC<SurveyTableProps> = ({
  data,
  loading,
  total,
  currentPage,
  pageSize,
  onPageChange,
  onViewDetail,
}) => {
  const tableRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    if (!loading && tableRef.current) {
      anime({
        targets: tableRef.current.querySelectorAll(".ant-table-row"),
        opacity: [0, 1],
        translateX: [-12, 0],
        duration: 350,
        delay: anime.stagger(40),
        easing: "easeOutQuart",
      });
    }
  }, [loading, data]);

  const { data: volunteerOptions = [] } = useQuery<VolunteerOption[]>({
    queryKey: ["volunteerOptions"],
    queryFn: fetchVolunteerOptions,
    staleTime: 60_000,
  });

  const statusMutation = useMutation({
    mutationFn: updateSurveyStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["surveys"] });
      messageApi.success("Status updated successfully");
    },
    onError: (err: Error) => {
      messageApi.error(err.message);
    },
  });

  const assignMutation = useMutation({
    mutationFn: assignVolunteer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["surveys"] });
      messageApi.success("Volunteer assigned successfully");
    },
    onError: (err: Error) => {
      messageApi.error(err.message);
    },
  });

  const handleStatusChange = (surveyId: string, status: SurveyStatus) => {
    statusMutation.mutate({ surveyId, status });
  };

  const handleAssignVolunteer = (surveyId: string) => {
    let selectedVolunteerId = "";
    Modal.confirm({
      title: "Assign Volunteer",
      icon: <UserAddOutlined style={{ color: "#1890ff" }} />,
      styles: {
        content: { background: "#0f1419", border: "1px solid #1e2d3d" },
        header: { background: "#0f1419", borderBottom: "1px solid #1e2d3d" },
        footer: { borderTop: "1px solid #1e2d3d" },
        mask: { backdropFilter: "blur(4px)" },
      },
      content: (
        <div style={{ marginTop: 16 }}>
          <Text style={{ color: "#9cc4e8", display: "block", marginBottom: 8 }}>
            Select a volunteer to assign:
          </Text>
          <Select
            style={{ width: "100%" }}
            placeholder="Choose volunteer"
            options={volunteerOptions.map((v) => ({
              label: `${v.name} — ${v.zone} (${v.activeAssignments} active)`,
              value: v.id,
            }))}
            onChange={(val) => {
              selectedVolunteerId = val;
            }}
          />
        </div>
      ),
      onOk: () => {
        if (!selectedVolunteerId) {
          messageApi.warning("Please select a volunteer");
          return Promise.reject();
        }
        return assignMutation.mutateAsync({
          surveyId,
          volunteerId: selectedVolunteerId,
        });
      },
      okText: "Assign",
      cancelText: "Cancel",
      okButtonProps: { style: { background: "#1890ff" } },
    });
  };

  const columns: ColumnsType<Survey> = [
    {
      title: "Survey ID",
      dataIndex: "id",
      key: "id",
      width: 150,
      render: (id: string) => (
        <Text style={{ color: "#4a9eff", fontFamily: "monospace", fontSize: 12, letterSpacing: "0.5px" }}>
          {id}
        </Text>
      ),
    },
    {
      title: "Citizen Name",
      dataIndex: "citizenName",
      key: "citizenName",
      width: 150,
      render: (name: string) => (
        <Text strong style={{ color: "#c8dff0" }}>{name}</Text>
      ),
    },
    {
      title: "Location",
      key: "location",
      width: 160,
      render: (_, record) => (
        <div>
          <Text style={{ color: "#c8dff0", display: "block", fontSize: 13 }}>
            {record.location.village}
          </Text>
          <Text style={{ color: "#4a7a9b", fontSize: 11 }}>
            {record.location.district}, {record.location.pincode}
          </Text>
        </div>
      ),
    },
    {
      title: "Issue Category",
      dataIndex: "issueCategory",
      key: "issueCategory",
      width: 160,
      render: (cat) => (
        <Tag style={{ background: "#0d2137", border: "1px solid #1e3a5f", color: "#7eb8f7", borderRadius: 12, fontSize: 11 }}>
          {formatCategory(cat)}
        </Tag>
      ),
    },
    {
      title: "Priority",
      dataIndex: "priority",
      key: "priority",
      width: 110,
      render: (priority: SurveyPriority) => (
        <Tag
          color={PRIORITY_COLOR_MAP[priority]}
          icon={priority === SurveyPriority.CRITICAL ? <ThunderboltOutlined /> : undefined}
          style={{ borderRadius: 12, fontSize: 11 }}
        >
          {priority}
        </Tag>
      ),
      sorter: (a, b) => {
        const order = [SurveyPriority.CRITICAL, SurveyPriority.HIGH, SurveyPriority.MEDIUM, SurveyPriority.LOW];
        return order.indexOf(a.priority) - order.indexOf(b.priority);
      },
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 130,
      render: (status: SurveyStatus) => (
        <Tag
          color={STATUS_COLOR_MAP[status]}
          style={{ borderRadius: 12, fontSize: 11, minWidth: 80, textAlign: "center" }}
        >
          {status}
        </Tag>
      ),
    },
    {
      title: "Assigned Volunteer",
      key: "assignedVolunteer",
      width: 160,
      render: (_, record) =>
        record.assignedVolunteer ? (
          <div>
            <Text style={{ color: "#52c41a", display: "block", fontSize: 13 }}>
              {record.assignedVolunteer.name}
            </Text>
            <Text style={{ color: "#4a7a9b", fontSize: 11 }}>
              {record.assignedVolunteer.zone}
            </Text>
          </div>
        ) : (
          <Text style={{ color: "#3d5a73", fontSize: 12, fontStyle: "italic" }}>
            Unassigned
          </Text>
        ),
    },
    {
      title: "Submitted",
      dataIndex: "submissionDate",
      key: "submissionDate",
      width: 120,
      render: (date: string) => (
        <Text style={{ color: "#7a9ab8", fontSize: 12 }}>{formatDate(date)}</Text>
      ),
      sorter: (a, b) =>
        new Date(a.submissionDate).getTime() - new Date(b.submissionDate).getTime(),
      defaultSortOrder: "descend",
    },
    {
      title: "Actions",
      key: "actions",
      width: 160,
      fixed: "right",
      render: (_, record) => (
        <Space size={6}>
          <Tooltip title="View Details">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => onViewDetail(record.id)}
              style={{ color: "#4a9eff", background: "#0d1f2d", border: "1px solid #1e3a5f", borderRadius: 6 }}
              size="small"
            />
          </Tooltip>
          <Tooltip title="Assign Volunteer">
            <Button
              type="text"
              icon={<UserAddOutlined />}
              onClick={() => handleAssignVolunteer(record.id)}
              style={{ color: "#52c41a", background: "#0d1f0d", border: "1px solid #1e3a1e", borderRadius: 6 }}
              size="small"
            />
          </Tooltip>
          <Tooltip title="Update Status">
            <Select
              value={record.status}
              size="small"
              style={{ width: 105 }}
              onChange={(val) => handleStatusChange(record.id, val)}
              options={STATUS_OPTIONS}
              suffixIcon={<EditOutlined style={{ color: "#4a7a9b", fontSize: 10 }} />}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const pagination: TablePaginationConfig = {
    current: currentPage,
    pageSize,
    total,
    onChange: onPageChange,
    showSizeChanger: true,
    showTotal: (t, range) => `Showing ${range[0]}–${range[1]} of ${t} surveys`,
    pageSizeOptions: ["10", "25", "50"],
    style: { padding: "12px 0" },
  };

  return (
    <>
      {contextHolder}
      <div ref={tableRef}>
        <Table<Survey>
          columns={columns}
          dataSource={data}
          rowKey="id"
          loading={loading}
          pagination={pagination}
          scroll={{ x: 1300 }}
          size="middle"
          rowClassName={(record) =>
            record.priority === SurveyPriority.CRITICAL ||
            record.status === SurveyStatus.CRITICAL
              ? "critical-row"
              : ""
          }
          style={{ borderRadius: 8, overflow: "hidden" }}
        />
      </div>
    </>
  );
};

export default SurveyTable;
