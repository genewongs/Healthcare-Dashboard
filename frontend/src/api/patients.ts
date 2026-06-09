import { apiRequest } from "./client";
import type {
  PaginatedPatients,
  Patient,
  PatientCreate,
  PatientListParams,
  PatientNote,
  PatientNoteCreate,
  PatientNoteUpdate,
  PatientSummary,
  PatientUpdate,
} from "../types/patient";

type PatientNoteApi = Omit<PatientNote, "isPinned"> & {
  is_pinned: boolean;
};

function toPatientNote(note: PatientNoteApi): PatientNote {
  const { is_pinned, ...rest } = note;
  return {
    ...rest,
    isPinned: is_pinned,
  };
}

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
  return apiRequest<PatientNoteApi[]>(`/patients/${patientId}/notes`).then((notes) =>
    notes.map(toPatientNote),
  );
}

export function addPatientNote(patientId: number, note: PatientNoteCreate) {
  return apiRequest<PatientNoteApi>(`/patients/${patientId}/notes`, {
    method: "POST",
    body: {
      content: note.content,
      category: note.category,
      is_pinned: note.isPinned,
      timestamp: note.timestamp,
    },
  }).then(toPatientNote);
}

export function updatePatientNote(
  patientId: number,
  noteId: number,
  note: PatientNoteUpdate,
) {
  return apiRequest<PatientNoteApi>(`/patients/${patientId}/notes/${noteId}`, {
    method: "PATCH",
    body: {
      is_pinned: note.isPinned,
    },
  }).then(toPatientNote);
}

export function deletePatientNote(patientId: number, noteId: number) {
  return apiRequest<void>(`/patients/${patientId}/notes/${noteId}`, {
    method: "DELETE",
  });
}

export function getPatientSummary(patientId: number) {
  return apiRequest<PatientSummary>(`/patients/${patientId}/summary`);
}
