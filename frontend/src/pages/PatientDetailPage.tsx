import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Link as RouterLink, useNavigate, useParams } from "react-router-dom";
import { deletePatient, getPatientById } from "../api/patients";
import { CircularBackButton } from "../components/Layout";
import { PatientNotes, PatientStatusChip, PatientSummaryCard } from "../components/Patients";
import type { Patient } from "../types/patient";

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

function formatAllergies(allergies: string[]) {
  return allergies.length > 0 ? allergies.join(", ") : "None documented";
}

function FieldValue({ label, value }: { label: string; value: string | null }) {
  return (
    <Box>
      <Typography color="text.secondary" variant="body2">
        {label}
      </Typography>
      <Typography variant="body1">{value || "Not recorded"}</Typography>
    </Box>
  );
}

function PatientSection({
  children,
  title,
}: {
  children: React.ReactNode;
  title: string;
}) {
  return (
    <Card variant="outlined">
      <CardContent>
        <Stack spacing={2}>
          <Typography variant="h6">{title}</Typography>
          <Divider />
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={3}
            sx={{ alignItems: "flex-start", flexWrap: "wrap" }}
          >
            {children}
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}

export function PatientDetailPage() {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
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

  const deleteMutation = useMutation({
    mutationFn: () => deletePatient(patientId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      navigate("/patients");
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

  const fullName = `${patient.first_name} ${patient.last_name}`;

  return (
    <Stack spacing={3}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        sx={{ alignItems: { xs: "flex-start", sm: "center" }, justifyContent: "space-between" }}
      >
        <Stack spacing={1}>
          <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", flexWrap: "wrap" }}>
            <CircularBackButton ariaLabel="Back to patients" to="/patients" />
            <Typography variant="h4">{fullName}</Typography>
            <PatientStatusChip status={patient.status} />
          </Stack>
        </Stack>

        <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
          <Button component={RouterLink} to={`/patients/${patient.id}/edit`} variant="contained">
            Edit
          </Button>
          <Button
            color="error"
            onClick={() => setDeleteDialogOpen(true)}
            variant="outlined"
          >
            Delete patient
          </Button>
        </Stack>
      </Stack>

      <PatientSection title="Personal Information">
        <FieldValue label="Age" value={calculateAge(patient.date_of_birth)} />
        <FieldValue label="Date of birth" value={formatDate(patient.date_of_birth)} />
        <FieldValue label="Phone" value={patient.phone} />
        <FieldValue label="Email" value={patient.email} />
        <FieldValue label="Address" value={patient.address} />
      </PatientSection>

      <PatientSection title="Medical Information">
        <FieldValue label="Blood type" value={patient.blood_type} />
        <FieldValue label="Conditions" value={patient.conditions} />
        <FieldValue label="Allergies" value={formatAllergies(patient.allergies)} />
        <FieldValue label="Last visit" value={formatDate(patient.last_visit)} />
      </PatientSection>

      <PatientSummaryCard patientId={patient.id} />

      <PatientNotes patientId={patient.id} />

      {deleteMutation.isError ? (
        <Alert severity="error">Unable to delete patient. Please try again.</Alert>
      ) : null}

      <DeletePatientDialog
        deleting={deleteMutation.isPending}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={() => deleteMutation.mutate()}
        open={deleteDialogOpen}
        patient={patient}
      />
    </Stack>
  );
}

function DeletePatientDialog({
  deleting,
  onClose,
  onConfirm,
  open,
  patient,
}: {
  deleting: boolean;
  onClose: () => void;
  onConfirm: () => void;
  open: boolean;
  patient: Patient;
}) {
  const fullName = `${patient.first_name} ${patient.last_name}`;

  return (
    <Dialog onClose={deleting ? undefined : onClose} open={open}>
      <DialogTitle>Delete patient?</DialogTitle>
      <DialogContent>
        <DialogContentText>
          This will permanently delete {fullName}. This action cannot be undone.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button disabled={deleting} onClick={onClose}>
          Cancel
        </Button>
        <Button color="error" disabled={deleting} onClick={onConfirm} variant="contained">
          {deleting ? "Deleting..." : "Delete"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
