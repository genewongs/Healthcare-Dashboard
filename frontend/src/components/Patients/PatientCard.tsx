import { Avatar, Box, Card, CardActionArea, CardContent, Stack, Typography } from "@mui/material";
import { IoCallOutline, IoCalendarOutline, IoEllipsisVertical } from "react-icons/io5";
import { Link as RouterLink } from "react-router-dom";
import type { Patient } from "../../types/patient";
import { PatientStatusChip } from "./PatientStatusChip";

type PatientCardProps = {
  patient: Patient;
};

function calculateAge(dateOfBirth: string | null) {
  if (!dateOfBirth) {
    return "Unknown";
  }

  const birthDate = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const hasHadBirthdayThisYear =
    today.getMonth() > birthDate.getMonth() ||
    (today.getMonth() === birthDate.getMonth() && today.getDate() >= birthDate.getDate());

  if (!hasHadBirthdayThisYear) {
    age -= 1;
  }

  return `${age}`;
}

function formatDate(date: string | null) {
  if (!date) {
    return "Not recorded";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

function getInitials(patient: Patient) {
  return `${patient.first_name.charAt(0)}${patient.last_name.charAt(0)}`.toUpperCase();
}

export function PatientCard({ patient }: PatientCardProps) {
  const fullName = `${patient.first_name} ${patient.last_name}`;

  return (
    <Card variant="outlined">
      <CardActionArea component={RouterLink} to={`/patients/${patient.id}`}>
        <CardContent sx={{ p: { xs: 2, sm: 2.25 } }}>
          <Stack
            direction={{ xs: "row", sm: "row" }}
            spacing={2}
            sx={{
              alignItems: "flex-start",
              justifyContent: "space-between",
            }}
          >
            <Stack
              direction="row"
              spacing={{ xs: 1.75, sm: 2 }}
              sx={{ alignItems: "flex-start", minWidth: 0 }}
            >
              <Avatar
                sx={{
                  bgcolor: "primary.light",
                  color: "primary.main",
                  fontSize: { xs: 24, sm: 20 },
                  fontWeight: 800,
                  height: { xs: 72, sm: 56 },
                  width: { xs: 72, sm: 56 },
                }}
              >
                {getInitials(patient)}
              </Avatar>
              <Stack spacing={{ xs: 1, sm: 0.75 }} sx={{ minWidth: 0 }}>
                <Typography
                  sx={{ fontSize: { xs: 24, sm: 20 }, overflowWrap: "anywhere" }}
                  variant="h6"
                >
                  {fullName}
                </Typography>
                <Stack
                  direction="row"
                  spacing={{ xs: 1.25, sm: 1.5 }}
                  sx={{
                    alignItems: "center",
                    color: "text.secondary",
                    flexWrap: "wrap",
                  }}
                >
                  <Typography variant="body2">Age {calculateAge(patient.date_of_birth)}</Typography>
                  <Typography variant="body2">DOB: {formatDate(patient.date_of_birth)}</Typography>
                  {patient.phone ? (
                    <Stack direction="row" spacing={0.5} sx={{ alignItems: "center" }}>
                      <IoCallOutline />
                      <Typography variant="body2">{patient.phone}</Typography>
                    </Stack>
                  ) : null}
                </Stack>
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={{ xs: 1, sm: 2 }}
                  sx={{
                    alignItems: { xs: "flex-start", sm: "center" },
                    display: { xs: "flex", sm: "none" },
                  }}
                >
                  <Stack
                    direction="row"
                    spacing={0.75}
                    sx={{ alignItems: "center", color: "text.secondary" }}
                  >
                    <IoCalendarOutline />
                    <Typography variant="body2">
                      Last visit: {formatDate(patient.last_visit)}
                    </Typography>
                  </Stack>
                  <PatientStatusChip status={patient.status} />
                </Stack>
              </Stack>
            </Stack>
            <Stack
              direction="row"
              spacing={2}
              sx={{
                alignItems: "center",
                display: { xs: "none", sm: "flex" },
                flexShrink: 0,
              }}
            >
              <Stack
                direction="row"
                spacing={0.75}
                sx={{ alignItems: "center", color: "text.secondary" }}
              >
                <IoCalendarOutline />
                <Typography variant="body2">
                  Last visit: {formatDate(patient.last_visit)}
                </Typography>
              </Stack>
              <PatientStatusChip status={patient.status} />
            </Stack>
            <Box
              aria-hidden="true"
              sx={{
                color: "text.secondary",
                display: { xs: "flex", sm: "none" },
                flexShrink: 0,
                fontSize: 22,
                pt: 0.5,
              }}
            >
              <IoEllipsisVertical />
            </Box>
          </Stack>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
