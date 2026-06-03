import { ApiError } from "../api/client";
import type {
  PatientFormServerErrors,
  PatientFormSubmitValues,
} from "../components/Patients";

const patientFormFields = new Set<keyof PatientFormSubmitValues>([
  "first_name",
  "last_name",
  "date_of_birth",
  "phone",
  "email",
  "address",
  "blood_type",
  "allergies",
  "conditions",
  "status",
  "last_visit",
]);

function isPatientFormField(value: unknown): value is keyof PatientFormSubmitValues {
  return typeof value === "string" && patientFormFields.has(value as keyof PatientFormSubmitValues);
}

export function getPatientFormServerError(error: unknown, fallback: string) {
  if (!(error instanceof ApiError)) {
    return fallback;
  }

  if (typeof error.detail === "string") {
    return error.detail;
  }

  return "Please review the highlighted fields and try again.";
}

export function getPatientFormServerFieldErrors(error: unknown): PatientFormServerErrors {
  if (!(error instanceof ApiError) || !Array.isArray(error.detail)) {
    return {};
  }

  return error.detail.reduce<PatientFormServerErrors>((fieldErrors, item) => {
    const location = Array.isArray(item.loc) ? item.loc : [];
    const fieldName = location[location.length - 1];

    if (isPatientFormField(fieldName)) {
      fieldErrors[fieldName] = typeof item.msg === "string" ? item.msg : "Invalid value";
    }

    return fieldErrors;
  }, {});
}
