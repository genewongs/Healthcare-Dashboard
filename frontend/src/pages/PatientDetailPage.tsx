import {
  Alert,
  Accordion,
  AccordionDetails,
  AccordionSummary,
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
  IconButton,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { IoChevronDown } from "react-icons/io5";
import { Link as RouterLink, useNavigate, useParams } from "react-router-dom";
import { deletePatient, getPatientById } from "../api/patients";
import { CircularBackButton } from "../components/Layout";
import { PatientNotes, PatientStatusChip, PatientSummaryCard } from "../components/Patients";
import type { Patient } from "../types/patient";
import { MdOutlineModeEditOutline } from "react-icons/md";
import { RiDeleteBinLine } from "react-icons/ri";

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

function FieldValue({
  componentField,
  label,
  value,
}: {
  componentField?: ReactNode;
  label: string;
  value?: string | null;
}) {
  return (
    <Box sx={{ minWidth: { md: 120 } }}>
      <Typography color="text.secondary" variant="body2">
        {label}
      </Typography>
      {componentField ?? <Typography variant="body1">{value || "Not recorded"}</Typography>}
    </Box>
  );
}

function FieldGrid({ children }: { children: ReactNode }) {
  return (
    <Stack
      direction={{ xs: "column", md: "row" }}
      spacing={{ xs: 2, md: 5 }}
      sx={{ alignItems: "flex-start", flexWrap: "wrap" }}
    >
      {children}
    </Stack>
  );
}

function PatientSection({ children, title }: { children: ReactNode; title: string }) {
  return (
    <Card variant="outlined">
      <CardContent>
        <Stack spacing={2}>
          <Typography sx={{ fontWeight: "bold" }}>{title}</Typography>
          <Divider />
          <FieldGrid>{children}</FieldGrid>
        </Stack>
      </CardContent>
    </Card>
  );
}

function DetailAccordion({
  children,
  defaultExpanded = false,
  title,
}: {
  children: ReactNode;
  defaultExpanded?: boolean;
  title: string;
}) {
  return (
    <Accordion defaultExpanded={defaultExpanded} disableGutters>
      <AccordionSummary expandIcon={<IoChevronDown />}>
        <Typography sx={{ fontWeight: "bold" }}>{title}</Typography>
      </AccordionSummary>
      <AccordionDetails>
        {children}
      </AccordionDetails>
    </Accordion>
  );
}

export function PatientDetailPage() {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const theme = useTheme();
  const isCompact = useMediaQuery(theme.breakpoints.down("md"));
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
  const personalFields = (
    <>
      <FieldValue label="Age" value={calculateAge(patient.date_of_birth)} />
      <FieldValue label="Date of birth" value={formatDate(patient.date_of_birth)} />
      <FieldValue label="Phone" value={patient.phone} />
      <FieldValue label="Email" value={patient.email} />
      <FieldValue label="Address" value={patient.address} />
      <FieldValue label="Status" componentField={<PatientStatusChip status={patient.status} />} />
    </>
  );
  const medicalFields = (
    <>
      <FieldValue label="Blood type" value={patient.blood_type} />
      <FieldValue label="Conditions" value={patient.conditions} />
      <FieldValue label="Allergies" value={formatAllergies(patient.allergies)} />
      <FieldValue label="Last visit" value={formatDate(patient.last_visit)} />
    </>
  );

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
            <Typography
              sx={{ minWidth: 0, overflowWrap: "anywhere" }}
              variant={isCompact ? "h5" : "h4"}
            >
              {fullName}
            </Typography>
            <IconButton
              aria-label={`Edit ${fullName}`}
              color="primary"
              component={RouterLink}
              to={`/patients/${patient.id}/edit`}
            >
              <MdOutlineModeEditOutline size={28} />
            </IconButton>
          </Stack>
        </Stack>

        <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
          <IconButton
            aria-label={`Delete ${fullName}`}
            color="error"
            onClick={() => setDeleteDialogOpen(true)}
          >
            <RiDeleteBinLine size={28} />
          </IconButton>
        </Stack>
      </Stack>

      {isCompact ? (
        <Stack spacing={1.5}>
          <DetailAccordion defaultExpanded title="Personal Information">
            <FieldGrid>{personalFields}</FieldGrid>
          </DetailAccordion>
          <DetailAccordion title="Medical Information">
            <FieldGrid>{medicalFields}</FieldGrid>
          </DetailAccordion>
          <DetailAccordion title="Patient Summary">
            <PatientSummaryCard patientId={patient.id} />
          </DetailAccordion>
          <DetailAccordion title="Patient Notes">
            <PatientNotes patientId={patient.id} />
          </DetailAccordion>
        </Stack>
      ) : (
        <>
          <PatientSection title="Personal Information">{personalFields}</PatientSection>
          <PatientSection title="Medical Information">{medicalFields}</PatientSection>
          <PatientSummaryCard patientId={patient.id} />
          <PatientNotes patientId={patient.id} />
        </>
      )}

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
