import {
  Alert,
  Avatar,
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
} from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import {
  IoCalendarOutline,
  IoCallOutline,
  IoDocumentTextOutline,
  IoFitnessOutline,
  IoHomeOutline,
  IoMailOutline,
  IoMedkitOutline,
  IoPersonOutline,
  IoWaterOutline,
} from "react-icons/io5";
import { MdOutlineModeEditOutline } from "react-icons/md";
import { RiDeleteBinLine } from "react-icons/ri";
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

function FieldValue({
  componentField,
  icon,
  label,
  value,
}: {
  componentField?: ReactNode;
  icon: ReactNode;
  label: string;
  value?: string | null;
}) {
  return (
    <Stack
      direction="row"
      spacing={1.5}
      sx={{ alignItems: "flex-start", minWidth: 0 }}
    >
      <Box
        sx={{
          alignItems: "center",
          bgcolor: "primary.light",
          borderRadius: 1.5,
          color: "primary.main",
          display: "flex",
          flexShrink: 0,
          height: 28,
          justifyContent: "center",
          mt: 0.25,
          width: 28,
        }}
      >
        {icon}
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography color="text.secondary" variant="body2">
          {label}
        </Typography>
        {componentField ?? (
          <Typography sx={{ overflowWrap: "anywhere" }} variant="body1">
            {value || "Not recorded"}
          </Typography>
        )}
      </Box>
    </Stack>
  );
}

function FieldGrid({ children }: { children: ReactNode }) {
  return (
    <Box
      sx={{
        display: "grid",
        gap: 2,
        gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))" },
      }}
    >
      {children}
    </Box>
  );
}

function PatientSection({
  children,
  icon,
  title,
}: {
  children: ReactNode;
  icon: ReactNode;
  title: string;
}) {
  return (
    <Card variant="outlined">
      <CardContent>
        <Stack spacing={2}>
          <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
            <Box sx={{ color: "primary.main", display: "flex", fontSize: 24 }}>
              {icon}
            </Box>
            <Typography variant="h6">{title}</Typography>
          </Stack>
          <Divider />
          <FieldGrid>{children}</FieldGrid>
        </Stack>
      </CardContent>
    </Card>
  );
}

function getInitials(patient: Patient) {
  return `${patient.first_name.charAt(0)}${patient.last_name.charAt(0)}`.toUpperCase();
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
  const personalFields = (
    <>
      <FieldValue icon={<IoPersonOutline />} label="Age" value={calculateAge(patient.date_of_birth)} />
      <FieldValue icon={<IoCalendarOutline />} label="Date of birth" value={formatDate(patient.date_of_birth)} />
      <FieldValue icon={<IoCallOutline />} label="Phone" value={patient.phone} />
      <FieldValue icon={<IoMailOutline />} label="Email" value={patient.email} />
      <FieldValue icon={<IoHomeOutline />} label="Address" value={patient.address} />
      <FieldValue
        componentField={<PatientStatusChip status={patient.status} />}
        icon={<IoFitnessOutline />}
        label="Status"
      />
    </>
  );
  const medicalFields = (
    <>
      <FieldValue icon={<IoWaterOutline />} label="Blood type" value={patient.blood_type} />
      <FieldValue icon={<IoMedkitOutline />} label="Conditions" value={patient.conditions} />
      <FieldValue icon={<IoFitnessOutline />} label="Allergies" value={formatAllergies(patient.allergies)} />
      <FieldValue icon={<IoCalendarOutline />} label="Last visit" value={formatDate(patient.last_visit)} />
    </>
  );

  return (
    <Stack spacing={3.5}>
      <Stack spacing={2}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <CircularBackButton ariaLabel="Back to patients" to="/patients" />
          <Typography>Back to patients</Typography>
        </Box>

        <Stack direction="row" spacing={1.5} sx={{ alignItems: "flex-start", minWidth: 0 }}>
            <Avatar
              sx={{
                bgcolor: "primary.light",
                color: "primary.main",
                flexShrink: 0,
                fontSize: { xs: 18, sm: 24, md: 30 },
                fontWeight: 800,
                height: { xs: 48, sm: 64, md: 88 },
                mt: { xs: 0.5, md: 0 },
                width: { xs: 48, sm: 64, md: 88 },
              }}
            >
              {getInitials(patient)}
            </Avatar>
            <Stack spacing={1} sx={{ flexGrow: 1, minWidth: 0 }}>
              <Stack
                direction={{ xs: "row", sm: "row" }}
                spacing={1}
                sx={{
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  minWidth: 0,
                }}
              >
                <Stack
                  direction="row"
                  spacing={1}
                  sx={{ alignItems: "center", flexWrap: "wrap", minWidth: 0 }}
                >
                  <Typography
                    sx={{
                      fontSize: { xs: 30, sm: 34, md: 42 },
                      lineHeight: 1.08,
                      overflowWrap: "anywhere",
                    }}
                    variant="h4"
                  >
                    {fullName}
                  </Typography>
                  <PatientStatusChip status={patient.status} />
                </Stack>
                <Stack direction="row" spacing={1} sx={{ flexShrink: 0 }}>
                  <IconButton
                    aria-label={`Edit ${fullName}`}
                    color="primary"
                    component={RouterLink}
                    sx={{
                      border: 1,
                      borderColor: "divider",
                      bgcolor: "background.paper",
                      height: { xs: 38, sm: 44, md: 48 },
                      width: { xs: 38, sm: 44, md: 48 },
                    }}
                    to={`/patients/${patient.id}/edit`}
                  >
                    <MdOutlineModeEditOutline size={22} />
                  </IconButton>
                  <IconButton
                    aria-label={`Delete ${fullName}`}
                    color="error"
                    onClick={() => setDeleteDialogOpen(true)}
                    sx={{
                      border: 1,
                      borderColor: "divider",
                      bgcolor: "background.paper",
                      height: { xs: 38, sm: 44, md: 48 },
                      width: { xs: 38, sm: 44, md: 48 },
                    }}
                  >
                    <RiDeleteBinLine size={22} />
                  </IconButton>
                </Stack>
              </Stack>
              <Typography color="text.secondary" variant="body1">
                {calculateAge(patient.date_of_birth)} years old · DOB{" "}
                {formatDate(patient.date_of_birth)} · Last visit{" "}
                {formatDate(patient.last_visit)}
              </Typography>
            </Stack>
        </Stack>
      </Stack>

      <Box
        sx={{
          display: "grid",
          gap: 2.5,
          gridTemplateColumns: { xs: "1fr", lg: "repeat(2, minmax(0, 1fr))" },
        }}
      >
        <PatientSection icon={<IoPersonOutline />} title="Personal Information">
          {personalFields}
        </PatientSection>
        <PatientSection icon={<IoMedkitOutline />} title="Medical Information">
          {medicalFields}
        </PatientSection>
        <PatientSummaryCard patientId={patient.id} />
        <PatientNotes patientId={patient.id} />
      </Box>

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
