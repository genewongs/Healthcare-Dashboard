import { zodResolver } from "@hookform/resolvers/zod";
import {
  Alert,
  Button,
  Card,
  CardContent,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import type { Patient, PatientStatus } from "../../types/patient";

const patientStatuses: PatientStatus[] = ["active", "inactive", "pending", "discharged"];

const optionalText = z.string().trim();

const optionalEmail = z.string().trim().refine(
  (value) => value === "" || z.email().safeParse(value).success,
  "Enter a valid email address",
);

const optionalDate = z.string().refine(
  (value) => value === "" || !Number.isNaN(Date.parse(value)),
  "Enter a valid date",
);

const patientFormSchema = z.object({
  first_name: z.string().trim().min(1, "First name is required"),
  last_name: z.string().trim().min(1, "Last name is required"),
  date_of_birth: optionalDate,
  phone: optionalText,
  email: optionalEmail,
  address: optionalText,
  blood_type: optionalText,
  allergies: optionalText,
  conditions: optionalText,
  status: z.enum(patientStatuses, "Select a valid status"),
  last_visit: optionalDate,
});

export type PatientFormValues = z.infer<typeof patientFormSchema>;

export type PatientFormSubmitValues = Omit<
  PatientFormValues,
  | "date_of_birth"
  | "phone"
  | "email"
  | "address"
  | "blood_type"
  | "allergies"
  | "conditions"
  | "last_visit"
> & {
  date_of_birth: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  blood_type: string | null;
  allergies: string | null;
  conditions: string | null;
  last_visit: string | null;
};

export type PatientFormServerErrors = Partial<Record<keyof PatientFormValues, string>>;

export type PatientFormProps = {
  mode: "create" | "edit";
  initialValues?: Patient | Partial<PatientFormValues>;
  isSubmitting?: boolean;
  onCancel?: () => void;
  onSubmit: (values: PatientFormSubmitValues) => void | Promise<void>;
  serverError?: string;
  serverFieldErrors?: PatientFormServerErrors;
};

const emptyValues: PatientFormValues = {
  first_name: "",
  last_name: "",
  date_of_birth: "",
  phone: "",
  email: "",
  address: "",
  blood_type: "",
  allergies: "",
  conditions: "",
  status: "active",
  last_visit: "",
};

function toFormValues(values?: Patient | Partial<PatientFormValues>): PatientFormValues {
  return {
    ...emptyValues,
    ...values,
    date_of_birth: values?.date_of_birth ?? "",
    phone: values?.phone ?? "",
    email: values?.email ?? "",
    address: values?.address ?? "",
    blood_type: values?.blood_type ?? "",
    allergies: values?.allergies ?? "",
    conditions: values?.conditions ?? "",
    last_visit: values?.last_visit ?? "",
    status: values?.status ?? "active",
  };
}

function fieldError(
  clientError: string | undefined,
  serverError: string | undefined,
) {
  return clientError ?? serverError;
}

function emptyToNull(value: string) {
  const trimmedValue = value.trim();
  return trimmedValue === "" ? null : trimmedValue;
}

function toSubmitValues(values: PatientFormValues): PatientFormSubmitValues {
  return {
    ...values,
    first_name: values.first_name.trim(),
    last_name: values.last_name.trim(),
    date_of_birth: emptyToNull(values.date_of_birth),
    phone: emptyToNull(values.phone),
    email: emptyToNull(values.email),
    address: emptyToNull(values.address),
    blood_type: emptyToNull(values.blood_type),
    allergies: emptyToNull(values.allergies),
    conditions: emptyToNull(values.conditions),
    last_visit: emptyToNull(values.last_visit),
  };
}

export function PatientForm({
  mode,
  initialValues,
  isSubmitting = false,
  onCancel,
  onSubmit,
  serverError,
  serverFieldErrors = {},
}: PatientFormProps) {
  const {
    control,
    formState: { errors },
    handleSubmit,
    register,
  } = useForm<PatientFormValues>({
    defaultValues: toFormValues(initialValues),
    resolver: zodResolver(patientFormSchema),
  });

  const submitLabel = mode === "create" ? "Create patient" : "Save changes";

  return (
    <Card variant="outlined">
      <CardContent>
        <Stack
          component="form"
          onSubmit={handleSubmit((values) => onSubmit(toSubmitValues(values)))}
          spacing={3}
        >
          <Stack spacing={1}>
            <Typography variant="h5">
              {mode === "create" ? "New patient" : "Edit patient"}
            </Typography>
            <Typography color="text.secondary" variant="body2">
              Enter personal and medical information for this patient.
            </Typography>
          </Stack>

          {serverError ? <Alert severity="error">{serverError}</Alert> : null}

          <Stack spacing={2}>
            <Typography variant="h6">Personal Information</Typography>
            <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
              <TextField
                {...register("first_name")}
                error={Boolean(fieldError(errors.first_name?.message, serverFieldErrors.first_name))}
                fullWidth
                helperText={fieldError(errors.first_name?.message, serverFieldErrors.first_name)}
                label="First name"
              />
              <TextField
                {...register("last_name")}
                error={Boolean(fieldError(errors.last_name?.message, serverFieldErrors.last_name))}
                fullWidth
                helperText={fieldError(errors.last_name?.message, serverFieldErrors.last_name)}
                label="Last name"
              />
            </Stack>

            <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
              <Controller
                control={control}
                name="date_of_birth"
                render={({ field }) => (
                  <TextField
                    {...field}
                    error={Boolean(
                      fieldError(errors.date_of_birth?.message, serverFieldErrors.date_of_birth),
                    )}
                    fullWidth
                    helperText={fieldError(
                      errors.date_of_birth?.message,
                      serverFieldErrors.date_of_birth,
                    )}
                    label="Date of birth"
                    type="date"
                    slotProps={{ inputLabel: { shrink: true } }}
                  />
                )}
              />
              <Controller
                control={control}
                name="last_visit"
                render={({ field }) => (
                  <TextField
                    {...field}
                    error={Boolean(
                      fieldError(errors.last_visit?.message, serverFieldErrors.last_visit),
                    )}
                    fullWidth
                    helperText={fieldError(errors.last_visit?.message, serverFieldErrors.last_visit)}
                    label="Last visit"
                    type="date"
                    slotProps={{ inputLabel: { shrink: true } }}
                  />
                )}
              />
            </Stack>

            <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
              <TextField
                {...register("phone")}
                error={Boolean(fieldError(errors.phone?.message, serverFieldErrors.phone))}
                fullWidth
                helperText={fieldError(errors.phone?.message, serverFieldErrors.phone)}
                label="Phone"
              />
              <TextField
                {...register("email")}
                error={Boolean(fieldError(errors.email?.message, serverFieldErrors.email))}
                fullWidth
                helperText={fieldError(errors.email?.message, serverFieldErrors.email)}
                label="Email"
              />
            </Stack>

            <TextField
              {...register("address")}
              error={Boolean(fieldError(errors.address?.message, serverFieldErrors.address))}
              fullWidth
              helperText={fieldError(errors.address?.message, serverFieldErrors.address)}
              label="Address"
              minRows={2}
              multiline
            />
          </Stack>

          <Stack spacing={2}>
            <Typography variant="h6">Medical Information</Typography>
            <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
              <TextField
                {...register("blood_type")}
                error={Boolean(fieldError(errors.blood_type?.message, serverFieldErrors.blood_type))}
                fullWidth
                helperText={fieldError(errors.blood_type?.message, serverFieldErrors.blood_type)}
                label="Blood type"
              />
              <Controller
                control={control}
                name="status"
                render={({ field }) => (
                  <FormControl
                    error={Boolean(fieldError(errors.status?.message, serverFieldErrors.status))}
                    fullWidth
                  >
                    <InputLabel id="patient-status-label">Status</InputLabel>
                    <Select label="Status" labelId="patient-status-label" {...field}>
                      {patientStatuses.map((status) => (
                        <MenuItem key={status} value={status}>
                          {status}
                        </MenuItem>
                      ))}
                    </Select>
                    <FormHelperText>
                      {fieldError(errors.status?.message, serverFieldErrors.status)}
                    </FormHelperText>
                  </FormControl>
                )}
              />
            </Stack>

            <TextField
              {...register("allergies")}
              error={Boolean(fieldError(errors.allergies?.message, serverFieldErrors.allergies))}
              fullWidth
              helperText={fieldError(errors.allergies?.message, serverFieldErrors.allergies)}
              label="Allergies"
              minRows={2}
              multiline
            />
            <TextField
              {...register("conditions")}
              error={Boolean(fieldError(errors.conditions?.message, serverFieldErrors.conditions))}
              fullWidth
              helperText={fieldError(errors.conditions?.message, serverFieldErrors.conditions)}
              label="Conditions"
              minRows={2}
              multiline
            />
          </Stack>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <Button disabled={isSubmitting} type="submit" variant="contained">
              {isSubmitting ? "Saving..." : submitLabel}
            </Button>
            {onCancel ? (
              <Button disabled={isSubmitting} onClick={onCancel} variant="outlined">
                Cancel
              </Button>
            ) : null}
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
