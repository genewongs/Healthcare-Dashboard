import { Stack, Typography } from "@mui/material";
import { DashboardAnalytics } from "../components/Dashboard";
import { PatientStatusOverview } from "../components/Patients";

export function DashboardPage() {
  return (
    <Stack spacing={3}>
      <Stack spacing={0.5}>
        <Typography variant="h4">Dashboard</Typography>
        <Typography color="text.secondary" variant="body1">
          Patient population overview
        </Typography>
      </Stack>

      <PatientStatusOverview />
      <DashboardAnalytics />
    </Stack>
  );
}
