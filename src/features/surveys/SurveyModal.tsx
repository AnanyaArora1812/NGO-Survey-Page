import React, { useEffect, useRef } from "react";
import {
  Modal,
  Descriptions,
  Tag,
  Spin,
  Alert,
  Badge,
  Typography,
  Space,
  Progress,
} from "antd";
import {
  EnvironmentOutlined,
  UserOutlined,
  CalendarOutlined,
  FileTextOutlined,
  ThunderboltOutlined,
} from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import anime from "animejs";

import { fetchSurveyById } from "../../services/surveyApi";
import {
  Survey,
  SurveyStatus,
  SurveyPriority,
} from "../../types/survey.types";
import {
  STATUS_COLOR_MAP,
  PRIORITY_COLOR_MAP,
  formatDate,
  formatCategory,
} from "./surveyUtils";

const { Title, Text } = Typography;

interface SurveyModalProps {
  surveyId: string | null;
  open: boolean;
  onClose: () => void;
}

const SurveyModal: React.FC<SurveyModalProps> = ({
  surveyId,
  open,
  onClose,
}) => {
  const contentRef = useRef<HTMLDivElement>(null);

  const {
    data: survey,
    isLoading,
    isError,
    error,
  } = useQuery<Survey, Error>({
    queryKey: ["survey", surveyId],
    queryFn: () => fetchSurveyById(surveyId!),
    enabled: !!surveyId && open,
    staleTime: 30_000,
  });

  useEffect(() => {
    if (survey && contentRef.current) {
      anime({
        targets: contentRef.current.querySelectorAll(".modal-section"),
        opacity: [0, 1],
        translateY: [18, 0],
        duration: 420,
        delay: anime.stagger(80),
        easing: "easeOutCubic",
      });
    }
  }, [survey]);

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={780}
      styles={{
        content: {
          background: "#0f1419",
          border: "1px solid #1e2d3d",
          borderRadius: 12,
          padding: 0,
        },
        header: { display: "none" },
        mask: { backdropFilter: "blur(4px)", background: "rgba(0,0,0,0.7)" },
      }}
      centered
    >
      <div
        style={{
          background: "linear-gradient(135deg, #0d1f2d 0%, #0a2540 100%)",
          borderBottom: "1px solid #1e3a5f",
          padding: "20px 28px 18px",
          borderRadius: "12px 12px 0 0",
        }}
      >
        <Space align="center" style={{ width: "100%", justifyContent: "space-between" }}>
          <Space>
            <FileTextOutlined style={{ color: "#1890ff", fontSize: 20 }} />
            <Title level={5} style={{ color: "#e8f4fd", margin: 0, letterSpacing: "0.5px" }}>
              Survey Detail Report
            </Title>
          </Space>
          {survey && (
            <Text style={{ color: "#4a9eff", fontFamily: "monospace", fontSize: 13 }}>
              {survey.id}
            </Text>
          )}
        </Space>
      </div>

      <div style={{ padding: "24px 28px 28px" }}>
        {isLoading && (
          <div style={{ textAlign: "center", padding: "48px 0" }}>
            <Spin size="large" />
            <p style={{ color: "#5c7a99", marginTop: 16 }}>
              Fetching survey data...
            </p>
          </div>
        )}

        {isError && (
          <Alert
            type="error"
            message="Failed to load survey"
            description={(error as Error)?.message}
            showIcon
          />
        )}

        {survey && (
          <div ref={contentRef}>
            <div
              className="modal-section"
              style={{ display: "flex", gap: 12, marginBottom: 20, opacity: 0 }}
            >
              <Tag
                color={STATUS_COLOR_MAP[survey.status]}
                style={{ fontSize: 13, padding: "3px 14px", borderRadius: 20 }}
              >
                {survey.status}
              </Tag>
              <Tag
                color={PRIORITY_COLOR_MAP[survey.priority]}
                icon={<ThunderboltOutlined />}
                style={{ fontSize: 13, padding: "3px 14px", borderRadius: 20 }}
              >
                {survey.priority} PRIORITY
              </Tag>
              <Tag
                style={{
                  fontSize: 13,
                  padding: "3px 14px",
                  borderRadius: 20,
                  background: "#0d2137",
                  border: "1px solid #1e3a5f",
                  color: "#7eb8f7",
                }}
              >
                {formatCategory(survey.issueCategory)}
              </Tag>
            </div>

            <div
              className="modal-section"
              style={{
                background: "#0d1f2d",
                border: "1px solid #1e3a5f",
                borderRadius: 8,
                padding: "16px 20px",
                marginBottom: 16,
                opacity: 0,
              }}
            >
              <Space style={{ marginBottom: 12 }}>
                <UserOutlined style={{ color: "#1890ff" }} />
                <Text strong style={{ color: "#9cc4e8", fontSize: 12, letterSpacing: "1px", textTransform: "uppercase" }}>
                  Citizen Information
                </Text>
              </Space>
              <Descriptions
                column={2}
                size="small"
                styles={{ label: { color: "#4a7a9b", fontSize: 12 }, content: { color: "#c8dff0", fontSize: 13 } }}
              >
                <Descriptions.Item label="Full Name">{survey.citizenName}</Descriptions.Item>
                <Descriptions.Item label="Phone">{survey.citizenPhone ?? "—"}</Descriptions.Item>
                <Descriptions.Item label="Aadhaar (last 4)">
                  {survey.citizenAadhaarLast4 ? `XXXX-XXXX-${survey.citizenAadhaarLast4}` : "—"}
                </Descriptions.Item>
              </Descriptions>
            </div>

            <div
              className="modal-section"
              style={{
                background: "#0d1f2d",
                border: "1px solid #1e3a5f",
                borderRadius: 8,
                padding: "16px 20px",
                marginBottom: 16,
                opacity: 0,
              }}
            >
              <Space style={{ marginBottom: 12 }}>
                <EnvironmentOutlined style={{ color: "#52c41a" }} />
                <Text strong style={{ color: "#9cc4e8", fontSize: 12, letterSpacing: "1px", textTransform: "uppercase" }}>
                  Location
                </Text>
              </Space>
              <Descriptions
                column={2}
                size="small"
                styles={{ label: { color: "#4a7a9b", fontSize: 12 }, content: { color: "#c8dff0", fontSize: 13 } }}
              >
                <Descriptions.Item label="District">{survey.location.district}</Descriptions.Item>
                <Descriptions.Item label="Taluk">{survey.location.taluk}</Descriptions.Item>
                <Descriptions.Item label="Village">{survey.location.village}</Descriptions.Item>
                <Descriptions.Item label="Pincode">{survey.location.pincode}</Descriptions.Item>
                {survey.location.coordinates && (
                  <Descriptions.Item label="GPS" span={2}>
                    {survey.location.coordinates.lat.toFixed(5)},{" "}
                    {survey.location.coordinates.lng.toFixed(5)}
                  </Descriptions.Item>
                )}
              </Descriptions>
            </div>

            <div
              className="modal-section"
              style={{
                background: "#0d1f2d",
                border: "1px solid #1e3a5f",
                borderRadius: 8,
                padding: "16px 20px",
                marginBottom: 16,
                opacity: 0,
              }}
            >
              <Text strong style={{ color: "#9cc4e8", fontSize: 12, letterSpacing: "1px", textTransform: "uppercase", display: "block", marginBottom: 10 }}>
                Issue Description
              </Text>
              <Text style={{ color: "#b8d4ec", lineHeight: "1.7", fontSize: 14 }}>
                {survey.issueDescription}
              </Text>
            </div>

            <div
              className="modal-section"
              style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, opacity: 0 }}
            >
              {survey.ocrConfidenceScore !== undefined && (
                <div style={{ background: "#0d1f2d", border: "1px solid #1e3a5f", borderRadius: 8, padding: "14px 18px" }}>
                  <Text style={{ color: "#4a7a9b", fontSize: 12, textTransform: "uppercase", letterSpacing: "1px" }}>
                    OCR Confidence
                  </Text>
                  <Progress
                    percent={survey.ocrConfidenceScore}
                    size="small"
                    strokeColor={
                      survey.ocrConfidenceScore >= 80 ? "#52c41a"
                      : survey.ocrConfidenceScore >= 50 ? "#faad14"
                      : "#ff4d4f"
                    }
                    style={{ marginTop: 8 }}
                  />
                </div>
              )}

              <div style={{ background: "#0d1f2d", border: "1px solid #1e3a5f", borderRadius: 8, padding: "14px 18px" }}>
                <Space direction="vertical" size={4}>
                  <Space>
                    <CalendarOutlined style={{ color: "#4a7a9b", fontSize: 12 }} />
                    <Text style={{ color: "#4a7a9b", fontSize: 12 }}>
                      Submitted: <span style={{ color: "#b8d4ec" }}>{formatDate(survey.submissionDate)}</span>
                    </Text>
                  </Space>
                  <Space>
                    <CalendarOutlined style={{ color: "#4a7a9b", fontSize: 12 }} />
                    <Text style={{ color: "#4a7a9b", fontSize: 12 }}>
                      Updated: <span style={{ color: "#b8d4ec" }}>{formatDate(survey.lastUpdated)}</span>
                    </Text>
                  </Space>
                </Space>
              </div>
            </div>

            {survey.assignedVolunteer && (
              <div
                className="modal-section"
                style={{
                  background: "linear-gradient(135deg, #0d2137, #0a1a2e)",
                  border: "1px solid #1e4060",
                  borderRadius: 8,
                  padding: "14px 18px",
                  marginTop: 16,
                  opacity: 0,
                }}
              >
                <Badge status="processing" color="#1890ff" text={
                  <Text strong style={{ color: "#9cc4e8", fontSize: 12, letterSpacing: "1px", textTransform: "uppercase" }}>
                    Assigned Volunteer
                  </Text>
                } />
                <Descriptions
                  column={2}
                  size="small"
                  style={{ marginTop: 10 }}
                  styles={{ label: { color: "#4a7a9b", fontSize: 12 }, content: { color: "#c8dff0", fontSize: 13 } }}
                >
                  <Descriptions.Item label="Name">{survey.assignedVolunteer.name}</Descriptions.Item>
                  <Descriptions.Item label="Phone">{survey.assignedVolunteer.phone}</Descriptions.Item>
                  <Descriptions.Item label="Zone">{survey.assignedVolunteer.zone}</Descriptions.Item>
                </Descriptions>
              </div>
            )}

            {survey.adminNotes && (
              <div
                className="modal-section"
                style={{
                  background: "#120d05",
                  border: "1px solid #3d2e05",
                  borderRadius: 8,
                  padding: "14px 18px",
                  marginTop: 16,
                  opacity: 0,
                }}
              >
                <Text strong style={{ color: "#d4a017", fontSize: 12, letterSpacing: "1px", textTransform: "uppercase", display: "block", marginBottom: 8 }}>
                  Admin Notes
                </Text>
                <Text style={{ color: "#c8a84b", fontSize: 13 }}>
                  {survey.adminNotes}
                </Text>
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};

export default SurveyModal;
