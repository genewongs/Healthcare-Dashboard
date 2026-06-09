import {
  Alert,
  Box,
  Card,
  CardContent,
  CircularProgress,
  Stack,
  Typography,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { IoDocumentTextOutline } from "react-icons/io5";
import { getPatientSummary } from "../../api/patients";

type PatientSummaryCardProps = {
  patientId: number;
};

export function PatientSummaryCard({ patientId }: PatientSummaryCardProps) {
  const {
    data,
    error,
    isError,
    isLoading,
  } = useQuery({
    queryKey: ["patient-summary", patientId],
    queryFn: () => getPatientSummary(patientId),
  });

  const errorMessage = error instanceof Error ? error.message : "Unable to load summary";

  return (
    <Card variant="outlined">
      <CardContent>
        <Stack spacing={2}>
          <Stack spacing={0.5}>
            <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
              <Box sx={{ color: "primary.main", display: "flex", fontSize: 24 }}>
                <IoDocumentTextOutline />
              </Box>
              <Typography variant="h6">Patient Summary</Typography>
            </Stack>
            <Typography color="text.secondary" variant="body2">
              Template-generated overview based on patient details and notes.
            </Typography>
          </Stack>

          {isLoading ? (
            <Box sx={{ alignItems: "center", display: "flex", minHeight: 96 }}>
              <CircularProgress aria-label="Loading patient summary" />
            </Box>
          ) : null}

          {isError ? <Alert severity="error">{errorMessage}</Alert> : null}

          {!isLoading && !isError && data ? (
            <Typography sx={{ whiteSpace: "pre-line" }} variant="body1">
              {data.summary}
            </Typography>
          ) : null}
        </Stack>
      </CardContent>
    </Card>
  );
}
