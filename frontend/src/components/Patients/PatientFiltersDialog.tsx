import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
} from "@mui/material";
import { useEffect, useState } from "react";
import type { PatientStatus, SortOrder } from "../../types/patient";

export type PatientAdvancedFilters = {
  ageMax: string;
  ageMin: string;
  lastVisitFrom: string;
  lastVisitTo: string;
  pageSize: number;
  sortOrder: SortOrder;
  status: PatientStatus | "";
};

type PatientFiltersDialogProps = {
  filters: PatientAdvancedFilters;
  onApply: (filters: PatientAdvancedFilters) => void;
  onClear: () => void;
  onClose: () => void;
  open: boolean;
};

const statusOptions: Array<{ label: string; value: PatientStatus | "" }> = [
  { label: "All statuses", value: "" },
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
  { label: "Pending", value: "pending" },
  { label: "Discharged", value: "discharged" },
];

const pageSizeOptions = [5, 10, 25, 50];

export function PatientFiltersDialog({
  filters,
  onApply,
  onClear,
  onClose,
  open,
}: PatientFiltersDialogProps) {
  const [draftFilters, setDraftFilters] = useState(filters);

  useEffect(() => {
    if (open) {
      setDraftFilters(filters);
    }
  }, [filters, open]);

  const updateDraft = <Key extends keyof PatientAdvancedFilters>(
    key: Key,
    value: PatientAdvancedFilters[Key],
  ) => {
    setDraftFilters((current) => ({ ...current, [key]: value }));
  };

  return (
    <Dialog fullWidth maxWidth="sm" onClose={onClose} open={open}>
      <DialogTitle>More filters</DialogTitle>
      <DialogContent>
        <Stack spacing={2.5} sx={{ pt: 1 }}>
          <FormControl fullWidth>
            <InputLabel id="advanced-status-label">Status</InputLabel>
            <Select
              label="Status"
              labelId="advanced-status-label"
              onChange={(event) =>
                updateDraft("status", event.target.value as PatientStatus | "")
              }
              value={draftFilters.status}
            >
              {statusOptions.map((option) => (
                <MenuItem key={option.label} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel id="advanced-page-size-label">Page size</InputLabel>
            <Select
              label="Page size"
              labelId="advanced-page-size-label"
              onChange={(event) => updateDraft("pageSize", Number(event.target.value))}
              value={String(draftFilters.pageSize)}
            >
              {pageSizeOptions.map((option) => (
                <MenuItem key={option} value={option}>
                  {option} / page
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField
              fullWidth
              label="Minimum age"
              onChange={(event) => updateDraft("ageMin", event.target.value)}
              slotProps={{ htmlInput: { max: 130, min: 0 } }}
              type="number"
              value={draftFilters.ageMin}
            />
            <TextField
              fullWidth
              label="Maximum age"
              onChange={(event) => updateDraft("ageMax", event.target.value)}
              slotProps={{ htmlInput: { max: 130, min: 0 } }}
              type="number"
              value={draftFilters.ageMax}
            />
          </Stack>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField
              fullWidth
              label="Last visited from"
              onChange={(event) => updateDraft("lastVisitFrom", event.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
              type="date"
              value={draftFilters.lastVisitFrom}
            />
            <TextField
              fullWidth
              label="Last visited to"
              onChange={(event) => updateDraft("lastVisitTo", event.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
              type="date"
              value={draftFilters.lastVisitTo}
            />
          </Stack>

          <FormControl fullWidth>
            <InputLabel id="advanced-sort-order-label">Sort direction</InputLabel>
            <Select
              label="Sort direction"
              labelId="advanced-sort-order-label"
              onChange={(event) => updateDraft("sortOrder", event.target.value as SortOrder)}
              value={draftFilters.sortOrder}
            >
              <MenuItem value="asc">Ascending</MenuItem>
              <MenuItem value="desc">Descending</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClear}>Clear all</Button>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={() => onApply(draftFilters)} variant="contained">
          Apply filters
        </Button>
      </DialogActions>
    </Dialog>
  );
}
