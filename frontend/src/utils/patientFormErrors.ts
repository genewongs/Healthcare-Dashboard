import { ApiError, getApiErrorMessage } from "../api/client";
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

function formatServerFieldMessage(message: unknown) {
  if (typeof message !== "string" || !message.trim()) {
    return "Invalid value";
  }

  if (message === "Field required") {
    return "This field is required";
  }

  return message.replace(/^Value error,\s*/i, "");
}

export function getPatientFormServerError(error: unknown, fallback: string) {
  if (!(error instanceof ApiError)) {
    return getApiErrorMessage(error, fallback);
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
    const fieldName = location.find(isPatientFormField);

    if (isPatientFormField(fieldName)) {
      fieldErrors[fieldName] = formatServerFieldMessage(item.msg);
    }

    return fieldErrors;
  }, {});
}
