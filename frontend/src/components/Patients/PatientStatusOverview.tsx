import { Alert, Box, Card, CardContent, CircularProgress, Stack, Typography } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import type { ReactNode } from "react";
import {
  IoCheckmarkCircleOutline,
  IoExitOutline,
  IoPeopleOutline,
  IoTimeOutline,
} from "react-icons/io5";
import { getPatients } from "../../api/patients";

type StatusMetric = {
  accent: "primary" | "success" | "warning" | "error";
  helper: string;
  icon: ReactNode;
  label: string;
  value: number;
};

async function getStatusOverview() {
  const [allPatients, activePatients, pendingPatients, inactivePatients, dischargedPatients] =
    await Promise.all([
      getPatients({ page: 1, page_size: 1 }),
      getPatients({ page: 1, page_size: 1, status: "active" }),
      getPatients({ page: 1, page_size: 1, status: "pending" }),
      getPatients({ page: 1, page_size: 1, status: "inactive" }),
      getPatients({ page: 1, page_size: 1, status: "discharged" }),
    ]);

  return {
    active: activePatients.total,
    discharged: dischargedPatients.total,
    inactive: inactivePatients.total,
    pending: pendingPatients.total,
    total: allPatients.total,
  };
}

function getPercentage(count: number, total: number) {
  if (!total) {
    return "0% of total";
  }

  return `${Math.round((count / total) * 100)}% of total`;
}

function StatusMetricCard({ metric }: { metric: StatusMetric }) {
  return (
    <Card sx={{ minWidth: { xs: 188, md: 0 } }} variant="outlined">
      <CardContent>
        <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
          <Box
            sx={{
              alignItems: "center",
              bgcolor: `${metric.accent}.light`,
              borderRadius: "50%",
              color: `${metric.accent}.main`,
              display: "flex",
              flexShrink: 0,
              height: 52,
              justifyContent: "center",
              width: 52,
            }}
          >
            {metric.icon}
          </Box>
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

export function PatientStatusOverview() {
  const { data, error, isError, isLoading } = useQuery({
    queryKey: ["patient-status-overview"],
    queryFn: getStatusOverview,
  });

  if (isLoading) {
    return (
      <Box sx={{ alignItems: "center", display: "flex", minHeight: 118 }}>
        <CircularProgress aria-label="Loading patient status overview" />
      </Box>
    );
  }

  if (isError || !data) {
    const message = error instanceof Error ? error.message : "Unable to load patient overview";
    return <Alert severity="error">{message}</Alert>;
  }

  const metrics: StatusMetric[] = [
    {
      accent: "primary",
      helper: "All time",
      icon: <IoPeopleOutline size={26} />,
      label: "Total patients",
      value: data.total,
    },
    {
      accent: "success",
      helper: getPercentage(data.active, data.total),
      icon: <IoCheckmarkCircleOutline size={26} />,
      label: "Active",
      value: data.active,
    },
    {
      accent: "warning",
      helper: getPercentage(data.pending, data.total),
      icon: <IoTimeOutline size={26} />,
      label: "Pending",
      value: data.pending,
    },
    {
      accent: "error",
      helper: `${data.inactive + data.discharged} inactive/discharged`,
      icon: <IoExitOutline size={26} />,
      label: "Other statuses",
      value: data.inactive + data.discharged,
    },
  ];

  return (
    <Box
      sx={{
        display: "grid",
        gap: 2,
        gridAutoColumns: { xs: "minmax(188px, 72vw)", sm: "minmax(188px, 1fr)" },
        gridAutoFlow: { xs: "column", sm: "initial" },
        gridTemplateColumns: { sm: "repeat(2, minmax(0, 1fr))", lg: "repeat(4, 1fr)" },
        overflowX: { xs: "auto", sm: "visible" },
        pb: { xs: 0.5, sm: 0 },
        scrollSnapType: { xs: "x proximity", sm: "none" },
        "& > *": {
          scrollSnapAlign: "start",
        },
      }}
    >
      {metrics.map((metric) => (
        <StatusMetricCard key={metric.label} metric={metric} />
      ))}
    </Box>
  );
}
