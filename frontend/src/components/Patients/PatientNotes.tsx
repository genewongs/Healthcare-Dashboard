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
  TextField,
  Typography,
} from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  addPatientNote,
  deletePatientNote,
  getPatientNotes,
} from "../../api/patients";
import type { PatientNote } from "../../types/patient";

type PatientNotesProps = {
  patientId: number;
};

function formatTimestamp(timestamp: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(timestamp));
}

export function PatientNotes({ patientId }: PatientNotesProps) {
  const [content, setContent] = useState("");
  const [contentError, setContentError] = useState("");
  const [noteToDelete, setNoteToDelete] = useState<PatientNote | null>(null);
  const queryClient = useQueryClient();
  const notesQueryKey = ["patient-notes", patientId];

  const {
    data: notes = [],
    error,
    isError,
    isLoading,
  } = useQuery({
    queryKey: notesQueryKey,
    queryFn: () => getPatientNotes(patientId),
  });

  const addNoteMutation = useMutation({
    mutationFn: (noteContent: string) => addPatientNote(patientId, { content: noteContent }),
    onSuccess: () => {
      setContent("");
      setContentError("");
      queryClient.invalidateQueries({ queryKey: notesQueryKey });
    },
  });

  const deleteNoteMutation = useMutation({
    mutationFn: (noteId: number) => deletePatientNote(patientId, noteId),
    onSuccess: () => {
      setNoteToDelete(null);
      queryClient.invalidateQueries({ queryKey: notesQueryKey });
    },
  });

  const handleAddNote = () => {
    const trimmedContent = content.trim();
    if (!trimmedContent) {
      setContentError("Note content is required");
      return;
    }

    addNoteMutation.mutate(trimmedContent);
  };

  const queryErrorMessage = error instanceof Error ? error.message : "Unable to load notes";

  return (
    <Card variant="outlined">
      <CardContent>
        <Stack spacing={3}>
          <Stack spacing={0.5}>
            <Typography variant="h6">Patient Notes</Typography>
            <Typography color="text.secondary" variant="body2">
              Track clinical notes for this patient.
            </Typography>
          </Stack>

          <Stack spacing={2}>
            <TextField
              error={Boolean(contentError)}
              fullWidth
              helperText={contentError || " "}
              label="Add note"
              minRows={3}
              multiline
              onChange={(event) => {
                setContent(event.target.value);
                if (contentError) {
                  setContentError("");
                }
              }}
              value={content}
            />
            <Box>
              <Button
                disabled={addNoteMutation.isPending}
                onClick={handleAddNote}
                variant="contained"
              >
                {addNoteMutation.isPending ? "Adding..." : "Add note"}
              </Button>
            </Box>
            {addNoteMutation.isError ? (
              <Alert severity="error">Unable to add note. Please try again.</Alert>
            ) : null}
          </Stack>

          <Divider />

          {isLoading ? (
            <Box sx={{ alignItems: "center", display: "flex", minHeight: 120 }}>
              <CircularProgress aria-label="Loading notes" />
            </Box>
          ) : null}

          {isError ? <Alert severity="error">{queryErrorMessage}</Alert> : null}

          {!isLoading && !isError && notes.length === 0 ? (
            <Alert severity="info">No notes have been added yet.</Alert>
          ) : null}

          {!isLoading && !isError && notes.length > 0 ? (
            <Stack spacing={2}>
              {notes.map((note) => (
                <Card key={note.id} variant="outlined">
                  <CardContent>
                    <Stack spacing={2}>
                      <Stack
                        direction={{ xs: "column", sm: "row" }}
                        spacing={1}
                        sx={{
                          alignItems: { xs: "flex-start", sm: "center" },
                          justifyContent: "space-between",
                        }}
                      >
                        <Typography color="text.secondary" variant="body2">
                          {formatTimestamp(note.timestamp)}
                        </Typography>
                        <Button
                          color="error"
                          onClick={() => setNoteToDelete(note)}
                          size="small"
                          variant="text"
                        >
                          Delete
                        </Button>
                      </Stack>
                      <Typography variant="body1">{note.content}</Typography>
                    </Stack>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          ) : null}

          {deleteNoteMutation.isError ? (
            <Alert severity="error">Unable to delete note. Please try again.</Alert>
          ) : null}
        </Stack>
      </CardContent>

      <Dialog
        onClose={deleteNoteMutation.isPending ? undefined : () => setNoteToDelete(null)}
        open={Boolean(noteToDelete)}
      >
        <DialogTitle>Delete note?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This will permanently delete this patient note.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            disabled={deleteNoteMutation.isPending}
            onClick={() => setNoteToDelete(null)}
          >
            Cancel
          </Button>
          <Button
            color="error"
            disabled={deleteNoteMutation.isPending}
            onClick={() => {
              if (noteToDelete) {
                deleteNoteMutation.mutate(noteToDelete.id);
              }
            }}
            variant="contained"
          >
            {deleteNoteMutation.isPending ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
}
