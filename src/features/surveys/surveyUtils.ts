import { SurveyStatus, SurveyPriority, IssueCategory } from "../../types/survey.types";

export const STATUS_COLOR_MAP: Record<SurveyStatus, string> = {
  [SurveyStatus.PENDING]:   "default",
  [SurveyStatus.VERIFIED]:  "blue",
  [SurveyStatus.ASSIGNED]:  "cyan",
  [SurveyStatus.COMPLETED]: "green",
  [SurveyStatus.CRITICAL]:  "red",
};

export const PRIORITY_COLOR_MAP: Record<SurveyPriority, string> = {
  [SurveyPriority.LOW]:      "default",
  [SurveyPriority.MEDIUM]:   "gold",
  [SurveyPriority.HIGH]:     "orange",
  [SurveyPriority.CRITICAL]: "red",
};

export const formatCategory = (cat: IssueCategory): string =>
  cat.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

export const formatDate = (iso: string): string => {
  const d = new Date(iso);
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export const STATUS_OPTIONS = Object.values(SurveyStatus).map((s) => ({
  label: s.charAt(0) + s.slice(1).toLowerCase(),
  value: s,
}));

export const PRIORITY_OPTIONS = Object.values(SurveyPriority).map((p) => ({
  label: p.charAt(0) + p.slice(1).toLowerCase(),
  value: p,
}));

export const CATEGORY_OPTIONS = Object.values(IssueCategory).map((c) => ({
  label: formatCategory(c),
  value: c,
}));
