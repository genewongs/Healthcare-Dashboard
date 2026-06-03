import { apiRequest } from "./client";
import type {
  PaginatedPatients,
  Patient,
  PatientCreate,
  PatientListParams,
  PatientNote,
  PatientNoteCreate,
  PatientSummary,
  PatientUpdate,
} from "../types/patient";

export function getPatients(params: PatientListParams = {}) {
  return apiRequest<PaginatedPatients>("/patients", { query: params });
}

export function getPatientById(id: number) {
  return apiRequest<Patient>(`/patients/${id}`);
}

export function createPatient(patient: PatientCreate) {
  return apiRequest<Patient>("/patients", {
    method: "POST",
    body: patient,
  });
}

export function updatePatient(id: number, patient: PatientUpdate) {
  return apiRequest<Patient>(`/patients/${id}`, {
    method: "PUT",
    body: patient,
  });
}

export function deletePatient(id: number) {
  return apiRequest<void>(`/patients/${id}`, {
    method: "DELETE",
  });
}

export function getPatientNotes(patientId: number) {
  return apiRequest<PatientNote[]>(`/patients/${patientId}/notes`);
}

export function addPatientNote(patientId: number, note: PatientNoteCreate) {
  return apiRequest<PatientNote>(`/patients/${patientId}/notes`, {
    method: "POST",
    body: note,
  });
}

export function deletePatientNote(patientId: number, noteId: number) {
  return apiRequest<void>(`/patients/${patientId}/notes/${noteId}`, {
    method: "DELETE",
  });
}

export function getPatientSummary(patientId: number) {
  return apiRequest<PatientSummary>(`/patients/${patientId}/summary`);
}

