import {
  Alert,
  Box,
  Card,
  CardContent,
  CircularProgress,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import type { ReactNode } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { getDashboardStats } from "../../api/dashboard";
import type { DashboardDistributionItem } from "../../types/dashboard";

const statusLabels: Record<string, string> = {
  active: "Active",
  discharged: "Discharged",
  inactive: "Inactive",
  pending: "Pending",
};

function formatLabel(label: string) {
  return statusLabels[label] ?? label;
}

function formatNumber(value: number) {
  return new Intl.NumberFormat().format(value);
}

function getTotal(items: DashboardDistributionItem[]) {
  return items.reduce((sum, item) => sum + item.count, 0);
}

function ChartCard({
  children,
  subtitle,
  title,
}: {
  children: ReactNode;
  subtitle: string;
  title: string;
}) {
  return (
    <Card sx={{ height: "100%" }} variant="outlined">
      <CardContent>
        <Stack spacing={2}>
          <Box>
            <Typography variant="h6">{title}</Typography>
            <Typography color="text.secondary" variant="body2">
              {subtitle}
            </Typography>
          </Box>
          {children}
        </Stack>
      </CardContent>
    </Card>
  );
}

function EmptyChart() {
  return (
    <Box
      sx={{
        alignItems: "center",
        display: "flex",
        height: 260,
        justifyContent: "center",
      }}
    >
      <Typography color="text.secondary" variant="body2">
        No data available.
      </Typography>
    </Box>
  );
}

function StatusDistributionChart({ data }: { data: DashboardDistributionItem[] }) {
  const theme = useTheme();
  const total = getTotal(data);
  const colors = [
    theme.palette.success.main,
    theme.palette.warning.main,
    theme.palette.error.main,
    theme.palette.divider,
  ];

  if (!total) {
    return <EmptyChart />;
  }

  return (
    <Box sx={{ height: 260 }}>
      <ResponsiveContainer height="100%" width="100%">
        <PieChart>
          <Pie
            cx="50%"
            cy="50%"
            data={data.map((item) => ({ ...item, label: formatLabel(item.label) }))}
            dataKey="count"
            innerRadius={58}
            nameKey="label"
            outerRadius={88}
            paddingAngle={2}
          >
            {data.map((item, index) => (
              <Cell fill={colors[index % colors.length]} key={item.label} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => formatNumber(Number(value))} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </Box>
  );
}

function AgeDemographicsChart({ data }: { data: DashboardDistributionItem[] }) {
  const theme = useTheme();

  if (!getTotal(data)) {
    return <EmptyChart />;
  }

  return (
    <Box sx={{ height: 260 }}>
      <ResponsiveContainer height="100%" width="100%">
        <BarChart data={data} margin={{ bottom: 6, left: 8, right: 8, top: 8 }}>
          <CartesianGrid stroke={theme.palette.divider} vertical={false} />
          <XAxis dataKey="label" stroke={theme.palette.text.secondary} />
          <YAxis
            stroke={theme.palette.text.secondary}
            tickFormatter={(value) => `${value / 1000}k`}
          />
          <Tooltip formatter={(value) => formatNumber(Number(value))} />
          <Bar dataKey="count" fill={theme.palette.primary.main} radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
}

function BloodTypeChart({ data }: { data: DashboardDistributionItem[] }) {
  const theme = useTheme();

  if (!getTotal(data)) {
    return <EmptyChart />;
  }

  return (
    <Box sx={{ height: 260 }}>
      <ResponsiveContainer height="100%" width="100%">
        <BarChart data={data} margin={{ bottom: 6, left: 8, right: 8, top: 8 }}>
          <CartesianGrid stroke={theme.palette.divider} vertical={false} />
          <XAxis dataKey="label" stroke={theme.palette.text.secondary} />
          <YAxis
            stroke={theme.palette.text.secondary}
            tickFormatter={(value) => `${value / 1000}k`}
          />
          <Tooltip formatter={(value) => formatNumber(Number(value))} />
          <Bar dataKey="count" fill={theme.palette.secondary.main} radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
}

function TopConditionsChart({ data }: { data: DashboardDistributionItem[] }) {
  const theme = useTheme();

  if (!getTotal(data)) {
    return <EmptyChart />;
  }

  return (
    <Box sx={{ height: 260 }}>
      <ResponsiveContainer height="100%" width="100%">
        <BarChart data={data} layout="vertical" margin={{ bottom: 8, left: 88, right: 16, top: 8 }}>
          <CartesianGrid stroke={theme.palette.divider} horizontal={false} />
          <XAxis
            stroke={theme.palette.text.secondary}
            tickFormatter={(value) => `${value / 1000}k`}
            type="number"
          />
          <YAxis
            dataKey="label"
            stroke={theme.palette.text.secondary}
            tick={{ fontSize: 12 }}
            type="category"
            width={92}
          />
          <Tooltip formatter={(value) => formatNumber(Number(value))} />
          <Bar dataKey="count" fill={theme.palette.primary.main} radius={[0, 6, 6, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
}

export function DashboardAnalytics() {
  const { data, error, isError, isLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: getDashboardStats,
  });

  if (isLoading) {
    return (
      <Box sx={{ alignItems: "center", display: "flex", minHeight: 260 }}>
        <CircularProgress aria-label="Loading dashboard analytics" />
      </Box>
    );
  }

  if (isError || !data) {
    const message = error instanceof Error ? error.message : "Unable to load dashboard analytics";
    return <Alert severity="error">{message}</Alert>;
  }

  return (
    <Box
      sx={{
        display: "grid",
        gap: 2,
        gridTemplateColumns: { xs: "1fr", lg: "repeat(2, minmax(0, 1fr))" },
      }}
    >
      <ChartCard
        subtitle="Breakdown of current patient statuses"
        title="Patient status distribution"
      >
        <StatusDistributionChart data={data.status_distribution} />
      </ChartCard>

      <ChartCard subtitle="Age groups across all patients" title="Age demographics">
        <AgeDemographicsChart data={data.age_demographics} />
      </ChartCard>

      <ChartCard subtitle="Recorded blood types across patients" title="Blood type distribution">
        <BloodTypeChart data={data.blood_type_distribution} />
      </ChartCard>

      <ChartCard subtitle="Most common conditions among active patients" title="Top conditions">
        <TopConditionsChart data={data.top_conditions} />
      </ChartCard>
    </Box>
  );
}
