import { Alert, Box, CircularProgress, Stack, Typography } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { getDashboardStats } from "../api/dashboard";
import { DashboardAnalytics, DashboardStatusOverview } from "../components/Dashboard";

export function DashboardPage() {
  const { data, error, isError, isLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: getDashboardStats,
  });

  const errorMessage = error instanceof Error ? error.message : "Unable to load dashboard data";

  return (
    <Stack spacing={3}>
      <Stack spacing={0.5}>
        <Typography variant="h4">Dashboard</Typography>
        <Typography color="text.secondary" variant="body1">
          Patient population overview
        </Typography>
      </Stack>

      {isLoading ? (
        <Box sx={{ alignItems: "center", display: "flex", minHeight: 260 }}>
          <CircularProgress aria-label="Loading dashboard" />
        </Box>
      ) : null}

      {isError ? <Alert severity="error">{errorMessage}</Alert> : null}

      {data ? (
        <>
          <DashboardStatusOverview stats={data} />
          <DashboardAnalytics stats={data} />
        </>
      ) : null}
    </Stack>
  );
}
