import { Alert, Box, Button, CircularProgress, Stack, Typography } from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link as RouterLink, useNavigate, useParams } from "react-router-dom";
import { getPatientById, updatePatient } from "../api/patients";
import { CircularBackButton } from "../components/Layout";
import { PatientForm, type PatientFormSubmitValues } from "../components/Patients";
import {
  getPatientFormServerError,
  getPatientFormServerFieldErrors,
} from "../utils/patientFormErrors";

export function EditPatientPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { id } = useParams();
  const patientId = Number(id);
  const hasValidPatientId = Number.isInteger(patientId) && patientId > 0;

  const {
    data: patient,
    error,
    isError,
    isLoading,
  } = useQuery({
    enabled: hasValidPatientId,
    queryKey: ["patient", patientId],
    queryFn: () => getPatientById(patientId),
  });

  const updateMutation = useMutation({
    mutationFn: (values: PatientFormSubmitValues) => updatePatient(patientId, values),
    onSuccess: (updatedPatient) => {
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      queryClient.invalidateQueries({ queryKey: ["patient", patientId] });
      navigate(`/patients/${updatedPatient?.id ?? patientId}`);
    },
  });

  if (!hasValidPatientId) {
    return (
      <Stack spacing={2}>
        <Button component={RouterLink} to="/patients" variant="text">
          Back to patients
        </Button>
        <Alert severity="error">Invalid patient id.</Alert>
      </Stack>
    );
  }

  if (isLoading) {
    return (
      <Box sx={{ alignItems: "center", display: "flex", minHeight: 240 }}>
        <CircularProgress aria-label="Loading patient" />
      </Box>
    );
  }

  if (isError || !patient) {
    const message = error instanceof Error ? error.message : "Unable to load patient";

    return (
      <Stack spacing={2}>
        <Button component={RouterLink} to="/patients" variant="text">
          Back to patients
        </Button>
        <Alert severity="error">{message}</Alert>
      </Stack>
    );
  }

  return (
    <Stack spacing={3}>
      <Stack spacing={1}>
        <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", flexWrap: "wrap" }}>
          <CircularBackButton ariaLabel="Back to patient" to={`/patients/${patient.id}`} />
          <Typography variant="h4">
            Edit {patient.first_name} {patient.last_name}
          </Typography>
        </Stack>
        <Typography color="text.secondary" variant="body1">
          Update {patient.first_name} {patient.last_name}'s patient record.
        </Typography>
      </Stack>

      {updateMutation.isSuccess ? (
        <Alert severity="success">Patient updated successfully.</Alert>
      ) : null}

      <PatientForm
        initialValues={patient}
        isSubmitting={updateMutation.isPending}
        mode="edit"
        onCancel={() => navigate(`/patients/${patient.id}`)}
        onSubmit={(values) => updateMutation.mutate(values)}
        serverError={
          updateMutation.isError
            ? getPatientFormServerError(
                updateMutation.error,
                "Unable to update patient. Please try again.",
              )
            : undefined
        }
        serverFieldErrors={
          updateMutation.isError
            ? getPatientFormServerFieldErrors(updateMutation.error)
            : undefined
        }
      />
    </Stack>
  );
}
