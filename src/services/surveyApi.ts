import axios, { AxiosError, AxiosResponse } from "axios";
import {
  SurveyListParams,
  SurveyListResponse,
  Survey,
  UpdateStatusPayload,
  AssignVolunteerPayload,
  VolunteerOption,
  ApiError,
} from "../types/survey.types";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000",
  timeout: 15_000,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("ngo_admin_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError<ApiError>) => {
    const message =
      error.response?.data?.message ??
      error.message ??
      "An unexpected error occurred";
    return Promise.reject(new Error(message));
  }
);

export const fetchSurveys = async (
  params: SurveyListParams = {}
): Promise<SurveyListResponse> => {
  const { data } = await api.get<SurveyListResponse>("/api/surveys", {
    params,
  });
  return data;
};

export const fetchSurveyById = async (id: string): Promise<Survey> => {
  const { data } = await api.get<Survey>(`/api/surveys/${id}`);
  return data;
};

export const updateSurveyStatus = async (
  payload: UpdateStatusPayload
): Promise<Survey> => {
  const { surveyId, ...body } = payload;
  const { data } = await api.patch<Survey>(
    `/api/surveys/${surveyId}/status`,
    body
  );
  return data;
};

export const assignVolunteer = async (
  payload: AssignVolunteerPayload
): Promise<Survey> => {
  const { surveyId, ...body } = payload;
  const { data } = await api.patch<Survey>(
    `/api/surveys/${surveyId}/assign`,
    body
  );
  return data;
};

export const fetchVolunteerOptions = async (): Promise<VolunteerOption[]> => {
  const { data } = await api.get<VolunteerOption[]>("/api/volunteers/options");
  return data;
};

export default api;
