import { Box, Card, CardContent, Stack, Typography } from "@mui/material";
import type { ReactNode } from "react";
import {
  IoCheckmarkCircleOutline,
  IoExitOutline,
  IoPeopleOutline,
  IoTimeOutline,
} from "react-icons/io5";
import type { DashboardStats } from "../../types/dashboard";
import { dashboardMetricGridStyles, dashboardMetricIconStyles } from "./dashboardStyles";

type StatusMetric = {
  accent: "primary" | "success" | "warning" | "error";
  helper: string;
  icon: ReactNode;
  label: string;
  value: number;
};

function getStatusCount(stats: DashboardStats, status: string) {
  return stats.status_distribution.find((item) => item.label === status)?.count ?? 0;
}

function getPercentage(count: number, total: number) {
  if (!total) {
    return "0% of total";
  }

  return `${Math.round((count / total) * 100)}% of total`;
}

function StatusMetricCard({ metric }: { metric: StatusMetric }) {
  return (
    <Card sx={{ minWidth: { xs: 188, md: 0 }}} variant="outlined">
      <CardContent>
        <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
          <Box sx={dashboardMetricIconStyles(metric.accent)}>{metric.icon}</Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography color="text.secondary" sx={{ fontWeight: "bold" }} variant="body2">
              {metric.label}
            </Typography>
            <Typography sx={{ fontWeight: 850, lineHeight: 1.1 }} variant="h5">
              {metric.value}
            </Typography>
            <Typography color={`${metric.accent}.main`} variant="body2">
              {metric.helper}
            </Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

export function DashboardStatusOverview({ stats }: { stats: DashboardStats }) {
  const active = getStatusCount(stats, "active");
  const pending = getStatusCount(stats, "pending");
  const inactive = getStatusCount(stats, "inactive");
  const discharged = getStatusCount(stats, "discharged");
  const total = stats.status_distribution.reduce((sum, item) => sum + item.count, 0);

  const metrics: StatusMetric[] = [
    {
      accent: "primary",
      helper: "All time",
      icon: <IoPeopleOutline size={26} />,
      label: "Total patients",
      value: total,
    },
    {
      accent: "success",
      helper: getPercentage(active, total),
      icon: <IoCheckmarkCircleOutline size={26} />,
      label: "Active",
      value: active,
    },
    {
      accent: "warning",
      helper: getPercentage(pending, total),
      icon: <IoTimeOutline size={26} />,
      label: "Pending",
      value: pending,
    },
    {
      accent: "error",
      helper: getPercentage(inactive + discharged, total),
      icon: <IoExitOutline size={26} />,
      label: "Other statuses",
      value: inactive + discharged,
    },
  ];

  return (
    <Box sx={dashboardMetricGridStyles}>
      {metrics.map((metric) => (
        <StatusMetricCard key={metric.label} metric={metric} />
      ))}
    </Box>
  );
}
