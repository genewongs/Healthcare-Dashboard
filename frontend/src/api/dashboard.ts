import { apiRequest } from "./client";
import type { DashboardStats } from "../types/dashboard";

export function getDashboardStats() {
  return apiRequest<DashboardStats>("/dashboard/stats");
}
