import { zodResolver } from "@hookform/resolvers/zod";
import {
  Alert,
  Button,
  Card,
  CardContent,
  Chip,
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
import { useState, type KeyboardEvent } from "react";
import { z } from "zod";
import type { BloodType, Patient, PatientStatus } from "../../types/patient";
import { formatPatientStatusLabel } from "./PatientStatusChip";

const patientStatuses: PatientStatus[] = ["active", "inactive", "pending", "discharged"];
const bloodTypes: BloodType[] = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const optionalPhone = z.string().trim().max(30, "Phone must be 30 characters or fewer");
const optionalAddress = z.string().trim().max(500, "Address must be 500 characters or fewer");
const optionalConditions = z.string().trim().max(500, "Conditions must be 500 characters or fewer");

const optionalEmail = z.string().trim().refine(
  (value) => value === "" || z.email().safeParse(value).success,
  "Enter a valid email address",
);

const optionalDate = z.string().refine(
  (value) => value === "" || !Number.isNaN(Date.parse(value)),
  "Enter a valid date",
);

const requiredDate = z.string().trim().min(1, "Last visit is required").refine(
  (value) => !Number.isNaN(Date.parse(value)),
  "Enter a valid date",
);

const patientFormSchema = z.object({
  first_name: z
    .string()
    .trim()
    .min(1, "First name is required")
    .max(100, "First name must be 100 characters or fewer"),
  last_name: z
    .string()
    .trim()
    .min(1, "Last name is required")
    .max(100, "Last name must be 100 characters or fewer"),
  date_of_birth: optionalDate,
  phone: optionalPhone,
  email: optionalEmail,
  address: optionalAddress,
  blood_type: z.enum(bloodTypes, "Select a valid blood type").or(z.literal("")),
  allergies: z.array(
    z
      .string()
      .trim()
      .min(1, "Allergy cannot be empty")
      .max(100, "Allergy entries must be 100 characters or fewer"),
  ),
  conditions: optionalConditions,
  status: z.enum(patientStatuses, "Select a valid status"),
  last_visit: requiredDate,
});

export type PatientFormValues = z.infer<typeof patientFormSchema>;

export type PatientFormSubmitValues = Omit<
  PatientFormValues,
  | "date_of_birth"
  | "phone"
  | "email"
  | "address"
  | "blood_type"
  | "conditions"
  | "last_visit"
> & {
  date_of_birth: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  blood_type: BloodType | null;
  conditions: string | null;
  last_visit: string;
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
  allergies: [],
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
    allergies: values?.allergies ?? [],
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

function AllergiesInput({
  error,
  onChange,
  value,
}: {
  error?: string;
  onChange: (value: string[]) => void;
  value: string[];
}) {
  const [inputValue, setInputValue] = useState("");

  const addAllergies = (rawValue: string) => {
    const existingAllergies = new Set(value.map((allergy) => allergy.toLowerCase()));
    const newAllergies = rawValue
      .split(",")
      .map((allergy) => allergy.trim())
      .filter(Boolean)
      .filter((allergy) => {
        const normalizedAllergy = allergy.toLowerCase();
        if (existingAllergies.has(normalizedAllergy)) {
          return false;
        }
        existingAllergies.add(normalizedAllergy);
        return true;
      });

    if (newAllergies.length > 0) {
      onChange([...value, ...newAllergies]);
    }
  };

  const handleInputChange = (nextValue: string) => {
    if (!nextValue.includes(",")) {
      setInputValue(nextValue);
      return;
    }

    const parts = nextValue.split(",");
    addAllergies(parts.slice(0, -1).join(","));
    setInputValue(parts[parts.length - 1] ?? "");
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "Enter") {
      return;
    }

    event.preventDefault();
    addAllergies(inputValue);
    setInputValue("");
  };

  const removeAllergy = (indexToRemove: number) => {
    onChange(value.filter((_, index) => index !== indexToRemove));
  };

  return (
    <Stack spacing={1}>
      <TextField
        error={Boolean(error)}
        fullWidth
        helperText={error || " "}
        label="Allergies"
        onBlur={() => {
          addAllergies(inputValue);
          setInputValue("");
        }}
        onChange={(event) => handleInputChange(event.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Separate allergies with commas"
        slotProps={{
          input: {
            startAdornment:
              value.length > 0 ? (
                <Stack
                  direction="row"
                  spacing={0.75}
                  sx={{
                    flexWrap: "wrap",
                    maxWidth: "100%",
                    rowGap: 0.75,
                    marginTop: 1,
                  }}
                >
                  {value.map((allergy, index) => (
                    <Chip
                      color="primary"
                      key={`${allergy}-${index}`}
                      label={allergy}
                      onDelete={() => removeAllergy(index)}
                      size="small"
                    />
                  ))}
                </Stack>
              ) : null,
            sx: {
              alignItems: "center",
              flexWrap: "wrap",
              gap: 0.75,
              minHeight: 44,
              py: value.length > 0 ? 0.75 : undefined,
              "& .MuiInputBase-input": {
                flexGrow: 1,
                minWidth: 180,
              },
            },
          },
        }}
        value={inputValue}
      />
    </Stack>
  );
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
    blood_type: values.blood_type === "" ? null : values.blood_type,
    allergies: values.allergies,
    conditions: emptyToNull(values.conditions),
    last_visit: values.last_visit,
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
                          {formatPatientStatusLabel(status)}
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
              <Controller
                control={control}
                name="blood_type"
                render={({ field }) => (
                  <FormControl
                    error={Boolean(
                      fieldError(errors.blood_type?.message, serverFieldErrors.blood_type),
                    )}
                    fullWidth
                  >
                    <InputLabel id="patient-blood-type-label">Blood type</InputLabel>
                    <Select label="Blood type" labelId="patient-blood-type-label" {...field}>
                      <MenuItem value="">Not recorded</MenuItem>
                      {bloodTypes.map((bloodType) => (
                        <MenuItem key={bloodType} value={bloodType}>
                          {bloodType}
                        </MenuItem>
                      ))}
                    </Select>
                    <FormHelperText>
                      {fieldError(errors.blood_type?.message, serverFieldErrors.blood_type)}
                    </FormHelperText>
                  </FormControl>
                )}
              />
            </Stack>

            <Controller
              control={control}
              name="allergies"
              render={({ field }) => (
                <AllergiesInput
                  error={fieldError(errors.allergies?.message, serverFieldErrors.allergies)}
                  onChange={field.onChange}
                  value={field.value}
                />
              )}
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
