import { Alert, Button, Stack, Typography } from "@mui/material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { createPatient } from "../api/patients";
import { PatientForm, type PatientFormSubmitValues } from "../components/Patients";
import {
  getPatientFormServerError,
  getPatientFormServerFieldErrors,
} from "../utils/patientFormErrors";

export function CreatePatientPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (values: PatientFormSubmitValues) => createPatient(values),
    onSuccess: (patient) => {
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      if (patient?.id) {
        navigate(`/patients/${patient.id}`);
        return;
      }
      navigate("/patients");
    },
  });

  return (
    <Stack spacing={3}>
      <Stack spacing={1}>
        <Button component={RouterLink} to="/patients" variant="text">
          Back to patients
        </Button>
        <Typography variant="h4">Create Patient</Typography>
        <Typography color="text.secondary" variant="body1">
          Add a new patient record.
        </Typography>
      </Stack>

      {createMutation.isSuccess ? (
        <Alert severity="success">Patient created successfully.</Alert>
      ) : null}

      <PatientForm
        isSubmitting={createMutation.isPending}
        mode="create"
        onCancel={() => navigate("/patients")}
        onSubmit={(values) => createMutation.mutate(values)}
        serverError={
          createMutation.isError
            ? getPatientFormServerError(
                createMutation.error,
                "Unable to create patient. Please try again.",
              )
            : undefined
        }
        serverFieldErrors={
          createMutation.isError
            ? getPatientFormServerFieldErrors(createMutation.error)
            : undefined
        }
      />
    </Stack>
  );
}
