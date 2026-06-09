import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { IoFlag, IoFlagOutline } from "react-icons/io5";
import { getApiErrorMessage } from "../../api/client";
import {
  addPatientNote,
  deletePatientNote,
  getPatientNotes,
  updatePatientNote,
} from "../../api/patients";
import type { PatientNote, PatientNoteCategory } from "../../types/patient";

type PatientNotesProps = {
  patientId: number;
};

const noteCategories: Array<{ label: string; value: PatientNoteCategory }> = [
  { label: "General", value: "general" },
  { label: "Medication", value: "medication" },
  { label: "Follow-up", value: "follow_up" },
  { label: "Concern", value: "concern" },
];
const maxNoteLength = 2000;

function formatTimestamp(timestamp: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(timestamp));
}

function formatCategoryLabel(category: PatientNoteCategory) {
  return noteCategories.find((option) => option.value === category)?.label ?? "General";
}

export function PatientNotes({ patientId }: PatientNotesProps) {
  const [content, setContent] = useState("");
  const [category, setCategory] = useState<PatientNoteCategory>("general");
  const [contentError, setContentError] = useState("");
  const [isPinned, setIsPinned] = useState(false);
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
    mutationFn: (noteContent: string) =>
      addPatientNote(patientId, {
        content: noteContent,
        category,
        isPinned,
      }),
    onSuccess: () => {
      setContent("");
      setContentError("");
      setCategory("general");
      setIsPinned(false);
      queryClient.invalidateQueries({ queryKey: notesQueryKey });
    },
  });

  const updateNoteMutation = useMutation({
    mutationFn: (note: PatientNote) =>
      updatePatientNote(patientId, note.id, { isPinned: !note.isPinned }),
    onSuccess: () => {
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

    if (trimmedContent.length > maxNoteLength) {
      setContentError(`Note content must be ${maxNoteLength} characters or fewer`);
      return;
    }

    addNoteMutation.mutate(trimmedContent);
  };

  const queryErrorMessage = error instanceof Error ? error.message : "Unable to load notes";
  const addNoteErrorMessage = getApiErrorMessage(
    addNoteMutation.error,
    "Unable to add note. Please try again.",
  );
  const updateNoteErrorMessage = getApiErrorMessage(
    updateNoteMutation.error,
    "Unable to update note. Please try again.",
  );
  const deleteNoteErrorMessage = getApiErrorMessage(
    deleteNoteMutation.error,
    "Unable to delete note. Please try again.",
  );

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
              slotProps={{ htmlInput: { maxLength: maxNoteLength } }}
              value={content}
            />
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={2}
              sx={{ alignItems: { xs: "stretch", sm: "center" } }}
            >
              <FormControl size="small" sx={{ minWidth: 180 }}>
                <InputLabel id="note-category-label">Category</InputLabel>
                <Select
                  label="Category"
                  labelId="note-category-label"
                  onChange={(event) =>
                    setCategory(event.target.value as PatientNoteCategory)
                  }
                  value={category}
                >
                  {noteCategories.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControlLabel
                control={
                  <Switch
                    checked={isPinned}
                    onChange={(event) => setIsPinned(event.target.checked)}
                  />
                }
                label="Pin note"
              />
              <Button
                disabled={addNoteMutation.isPending}
                onClick={handleAddNote}
                variant="contained"
              >
                {addNoteMutation.isPending ? "Adding..." : "Add note"}
              </Button>
            </Stack>
            {addNoteMutation.isError ? (
              <Alert severity="error">{addNoteErrorMessage}</Alert>
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
                        <Stack
                          direction="row"
                          spacing={1}
                          sx={{ alignItems: "center", flexWrap: "wrap" }}
                        >
                          {note.isPinned ? (
                            <Chip
                              color="warning"
                              icon={<IoFlag />}
                              label="Pinned"
                              size="small"
                            />
                          ) : null}
                          <Chip
                            label={formatCategoryLabel(note.category)}
                            size="small"
                            variant="outlined"
                          />
                          <Typography color="text.secondary" variant="body2">
                            {formatTimestamp(note.timestamp)}
                          </Typography>
                        </Stack>
                        <Stack direction="row" spacing={1}>
                          <Button
                            disabled={updateNoteMutation.isPending}
                            onClick={() => updateNoteMutation.mutate(note)}
                            size="small"
                            startIcon={note.isPinned ? <IoFlag /> : <IoFlagOutline />}
                            variant="text"
                          >
                            {note.isPinned ? "Unpin" : "Pin"}
                          </Button>
                          <Button
                            color="error"
                            onClick={() => setNoteToDelete(note)}
                            size="small"
                            variant="text"
                          >
                            Delete
                          </Button>
                        </Stack>
                      </Stack>
                      <Typography variant="body1">{note.content}</Typography>
                    </Stack>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          ) : null}

          {deleteNoteMutation.isError ? (
            <Alert severity="error">{deleteNoteErrorMessage}</Alert>
          ) : null}
          {updateNoteMutation.isError ? (
            <Alert severity="error">{updateNoteErrorMessage}</Alert>
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
