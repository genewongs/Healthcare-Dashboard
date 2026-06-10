import {
  Alert,
  Box,
  Button,
  Chip,
  FormControl,
  InputAdornment,
  InputLabel,
  MenuItem,
  Pagination,
  Select,
  Skeleton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { IoAdd, IoClose, IoFilter, IoSearch } from "react-icons/io5";
import { Link as RouterLink } from "react-router-dom";
import { getPatients } from "../api/patients";
import {
  formatPatientStatusLabel,
  PatientCard,
  PatientFiltersDialog,
  type PatientAdvancedFilters,
} from "../components/Patients";
import type { PatientSortField } from "../types/patient";
import {
  patientFilterBadgeStyles,
  patientFilterButtonStyles,
  patientListContentStyles,
  patientListToolbarStyles
} from "./PatientsList.styles";

const sortOptions: Array<{ label: string; value: PatientSortField }> = [
  { label: "Last name", value: "last_name" },
  { label: "First name", value: "first_name" },
  { label: "Last visit", value: "last_visit" },
  { label: "Status", value: "status" },
];

const pageSizeOptions = [5, 10, 25, 50];

const defaultAdvancedFilters: PatientAdvancedFilters = {
  ageMax: "",
  ageMin: "",
  lastVisitFrom: "",
  lastVisitTo: "",
  pageSize: 10,
  sortOrder: "asc",
  status: "",
};

function toOptionalNumber(value: string) {
  if (!value.trim()) {
    return undefined;
  }

  const parsedValue = Number(value);
  return Number.isFinite(parsedValue) ? parsedValue : undefined;
}

function getAdvancedFilterCount(filters: PatientAdvancedFilters) {
  return [
    filters.status,
    filters.ageMin,
    filters.ageMax,
    filters.lastVisitFrom,
    filters.lastVisitTo,
    filters.pageSize !== defaultAdvancedFilters.pageSize,
    filters.sortOrder !== defaultAdvancedFilters.sortOrder,
  ].filter(Boolean).length;
}

export function PatientsList() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sortBy, setSortBy] = useState<PatientSortField>("last_name");
  const [advancedFilters, setAdvancedFilters] = useState(defaultAdvancedFilters);
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 300);

    return () => window.clearTimeout(timeoutId);
  }, [search]);

  const queryParams = {
    page,
    page_size: advancedFilters.pageSize,
    search: debouncedSearch,
    status: advancedFilters.status || undefined,
    age_min: toOptionalNumber(advancedFilters.ageMin),
    age_max: toOptionalNumber(advancedFilters.ageMax),
    last_visit_from: advancedFilters.lastVisitFrom || undefined,
    last_visit_to: advancedFilters.lastVisitTo || undefined,
    sort_by: sortBy,
    sort_order: advancedFilters.sortOrder,
  };

  const { data, error, isError, isFetching, isLoading } = useQuery({
    queryKey: ["patients", queryParams],
    queryFn: () => getPatients(queryParams),
    placeholderData: keepPreviousData,
  });

  const handleSortByChange = (nextSortBy: PatientSortField) => {
    setSortBy(nextSortBy);
    setPage(1);
  };

  const handlePageSizeChange = (nextPageSize: number) => {
    setAdvancedFilters((current) => ({ ...current, pageSize: nextPageSize }));
    setPage(1);
  };

  const handleApplyFilters = (nextFilters: PatientAdvancedFilters) => {
    setAdvancedFilters(nextFilters);
    setFiltersOpen(false);
    setPage(1);
  };

  const clearFilter = (key: keyof PatientAdvancedFilters) => {
    setAdvancedFilters((current) => ({
      ...current,
      [key]: defaultAdvancedFilters[key],
    }));
    setPage(1);
  };

  const clearAllAdvancedFilters = () => {
    setAdvancedFilters(defaultAdvancedFilters);
    setPage(1);
  };

  if (isLoading) {
    return (
      <Stack spacing={3}>
        <PatientsHeader />
        <PatientListSkeleton />
      </Stack>
    );
  }

  if (isError) {
    const message = error instanceof Error ? error.message : "Unable to load patients";

    return (
      <Stack spacing={2}>
        <PatientsHeader />
        <Alert severity="error">{message}</Alert>
      </Stack>
    );
  }

  const patients = data?.items ?? [];
  const totalPages = data?.total_pages ?? 0;
  const activeFilterCount = getAdvancedFilterCount(advancedFilters);

  return (
    <Stack spacing={3}>
      <PatientsHeader total={data?.total} />

      <Stack spacing={1.5}>
        <Box sx={patientListToolbarStyles}>
          <TextField
            label="Search patients"
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search patients by name, phone, or email..."
            size="small"
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <IoSearch />
                  </InputAdornment>
                ),
              },
            }}
            sx={{ gridArea: "search", minWidth: 0 }}
            value={search}
          />

          <FormControl size="small" sx={{ gridArea: "sort", minWidth: 0 }}>
            <InputLabel id="patient-sort-by-label">Sort by</InputLabel>
            <Select
              label="Sort by"
              labelId="patient-sort-by-label"
              onChange={(event) => handleSortByChange(event.target.value as PatientSortField)}
              value={sortBy}
            >
              {sortOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Button
            onClick={() => setFiltersOpen(true)}
            startIcon={<IoFilter />}
            sx={patientFilterButtonStyles(activeFilterCount > 0)}
            variant="outlined"
          >
            More filters
            {activeFilterCount > 0 ? (
              <Box component="span" sx={patientFilterBadgeStyles}>
                {activeFilterCount}
              </Box>
            ) : null}
          </Button>

          <FormControl size="small" sx={{ gridArea: "page", minWidth: 0 }}>
            <InputLabel id="patient-page-size-label">Page size</InputLabel>
            <Select
              label="Page size"
              labelId="patient-page-size-label"
              onChange={(event) => handlePageSizeChange(Number(event.target.value))}
              value={String(advancedFilters.pageSize)}
            >
              {pageSizeOptions.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Button
            component={RouterLink}
            startIcon={<IoAdd />}
            sx={{ gridArea: "create", minHeight: 40, whiteSpace: "nowrap" }}
            to="/patients/new"
            variant="contained"
          >
            Create Patient
          </Button>
        </Box>

        <PatientFilterChips
          filters={advancedFilters}
          onClearAll={clearAllAdvancedFilters}
          onClearFilter={clearFilter}
        />
      </Stack>

      {filtersOpen ? (
        <PatientFiltersDialog
          filters={advancedFilters}
          onApply={handleApplyFilters}
          onClear={clearAllAdvancedFilters}
          onClose={() => setFiltersOpen(false)}
          open={filtersOpen}
        />
      ) : null}

      <Box sx={{ minHeight: 260, position: "relative" }}>
        <Box sx={patientListContentStyles(isFetching)}>
          {patients.length === 0 ? (
            <Alert severity="info">No patients found.</Alert>
          ) : (
            <Stack spacing={2}>
              {patients.map((patient) => (
                <PatientCard key={patient.id} patient={patient} />
              ))}
            </Stack>
          )}
        </Box>
      </Box>

      {totalPages > 1 ? (
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          sx={{ alignItems: { xs: "stretch", sm: "center" }, justifyContent: "space-between" }}
        >
          <Typography color="text.secondary" variant="body2">
            Page {data?.page ?? page} of {totalPages}
          </Typography>
          <Pagination
            count={totalPages}
            onChange={(_, nextPage) => setPage(nextPage)}
            page={page}
            shape="rounded"
          />
        </Stack>
      ) : null}
    </Stack>
  );
}

function PatientListSkeleton() {
  return (
    <Stack spacing={2} aria-label="Loading patients">
      {Array.from({ length: 5 }).map((_, index) => (
        <Box
          key={index}
          sx={{
            border: 1,
            borderColor: "divider",
            borderRadius: 1,
            p: 2,
          }}
        >
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            sx={{
              alignItems: { xs: "stretch", sm: "center" },
              justifyContent: "space-between",
            }}
          >
            <Stack spacing={1}>
              <Skeleton height={28} width={220} />
              <Skeleton height={20} width={80} />
            </Stack>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={2}
              sx={{ alignItems: { xs: "stretch", sm: "center" } }}
            >
              <Skeleton height={20} width={150} />
              <Skeleton height={24} sx={{ borderRadius: 8 }} width={86} />
            </Stack>
          </Stack>
        </Box>
      ))}
    </Stack>
  );
}

function PatientFilterChips({
  filters,
  onClearAll,
  onClearFilter,
}: {
  filters: PatientAdvancedFilters;
  onClearAll: () => void;
  onClearFilter: (key: keyof PatientAdvancedFilters) => void;
}) {
  const chips: Array<{
    key: string;
    label: string;
    onDelete: () => void;
  }> = [];

  if (filters.status) {
    chips.push({
      key: "status",
      label: `Status: ${formatPatientStatusLabel(filters.status)}`,
      onDelete: () => onClearFilter("status"),
    });
  }

  if (filters.ageMin || filters.ageMax) {
    chips.push({
      key: "age",
      label: `Age: ${filters.ageMin || "0"}-${filters.ageMax || "130"}`,
      onDelete: () => {
        onClearFilter("ageMin");
        onClearFilter("ageMax");
      },
    });
  }

  if (filters.lastVisitFrom || filters.lastVisitTo) {
    chips.push({
      key: "lastVisit",
      label: `Last visit: ${filters.lastVisitFrom || "Any"} to ${filters.lastVisitTo || "Any"}`,
      onDelete: () => {
        onClearFilter("lastVisitFrom");
        onClearFilter("lastVisitTo");
      },
    });
  }

  if (filters.pageSize !== defaultAdvancedFilters.pageSize) {
    chips.push({
      key: "pageSize",
      label: `${filters.pageSize} / page`,
      onDelete: () => onClearFilter("pageSize"),
    });
  }

  if (filters.sortOrder !== defaultAdvancedFilters.sortOrder) {
    chips.push({
      key: "sortOrder",
      label: filters.sortOrder === "asc" ? "Ascending" : "Descending",
      onDelete: () => onClearFilter("sortOrder"),
    });
  }

  if (chips.length === 0) {
    return null;
  }

  return (
    <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", rowGap: 1 }}>
      {chips.map((chip) => (
        <Chip
          deleteIcon={<IoClose />}
          key={chip.key}
          label={chip.label}
          onDelete={chip.onDelete}
          variant="outlined"
        />
      ))}
      {chips.length > 1 ? <Chip label="Clear all" onClick={onClearAll} variant="filled" /> : null}
    </Stack>
  );
}

function PatientsHeader({ total }: { total?: number }) {
  return (
    <Stack
      direction="row"
      spacing={2}
      sx={{
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <Box>
        <Typography sx={{fontSize: { xs: 42, sm: 48, md: 34 }}} variant="h4">
          Patients
        </Typography>
        <Typography color="text.secondary" variant="body1">
          {typeof total === "number"
            ? `${total} patient${total === 1 ? "" : "s"} found`
            : "Browse patient records"}
        </Typography>
      </Box>
    </Stack>
  );
}
