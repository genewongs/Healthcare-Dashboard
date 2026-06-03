import {
  Alert,
  Box,
  Button,
  FormControl,
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
import { Link as RouterLink } from "react-router-dom";
import { getPatients } from "../api/patients";
import { PatientCard } from "../components/Patients";
import type { PatientSortField, PatientStatus, SortOrder } from "../types/patient";

type StatusFilter = PatientStatus | "";

const statusOptions: Array<{ label: string; value: StatusFilter }> = [
  { label: "All statuses", value: "" },
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
  { label: "Pending", value: "pending" },
  { label: "Discharged", value: "discharged" },
];

const sortOptions: Array<{ label: string; value: PatientSortField }> = [
  { label: "Last name", value: "last_name" },
  { label: "First name", value: "first_name" },
  { label: "Last visit", value: "last_visit" },
  { label: "Status", value: "status" },
  { label: "Created date", value: "created_at" },
];

const pageSizeOptions = [5, 10, 25, 50];

export function PatientsList() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState<StatusFilter>("");
  const [sortBy, setSortBy] = useState<PatientSortField>("last_name");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 300);

    return () => window.clearTimeout(timeoutId);
  }, [search]);

  const queryParams = {
    page,
    page_size: pageSize,
    search: debouncedSearch,
    status: status || undefined,
    sort_by: sortBy,
    sort_order: sortOrder,
  };

  const { data, error, isError, isFetching, isLoading } = useQuery({
    queryKey: ["patients", queryParams],
    queryFn: () => getPatients(queryParams),
    placeholderData: keepPreviousData,
  });

  const handleStatusChange = (nextStatus: StatusFilter) => {
    setStatus(nextStatus);
    setPage(1);
  };

  const handleSortByChange = (nextSortBy: PatientSortField) => {
    setSortBy(nextSortBy);
    setPage(1);
  };

  const handlePageSizeChange = (nextPageSize: number) => {
    setPageSize(nextPageSize);
    setPage(1);
  };

  const toggleSortOrder = () => {
    setSortOrder((current) => (current === "asc" ? "desc" : "asc"));
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

  return (
    <Stack spacing={3}>
      <PatientsHeader total={data?.total} />

      <Stack
        direction={{ xs: "column", lg: "row" }}
        spacing={2}
        sx={{ alignItems: { xs: "stretch", lg: "center" } }}
      >
        <TextField
          label="Search patients"
          onChange={(event) => setSearch(event.target.value)}
          size="small"
          sx={{ flexGrow: 1 }}
          value={search}
        />

        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel id="patient-status-filter-label">Status</InputLabel>
          <Select
            label="Status"
            labelId="patient-status-filter-label"
            onChange={(event) => handleStatusChange(event.target.value as StatusFilter)}
            value={status}
          >
            {statusOptions.map((option) => (
              <MenuItem key={option.label} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 160 }}>
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

        <Button onClick={toggleSortOrder} size="large" variant="outlined">
          {sortOrder === "asc" ? "Ascending" : "Descending"}
        </Button>

        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel id="patient-page-size-label">Page size</InputLabel>
          <Select
            label="Page size"
            labelId="patient-page-size-label"
            onChange={(event) => handlePageSizeChange(Number(event.target.value))}
            value={String(pageSize)}
          >
            {pageSizeOptions.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>

      <Box sx={{ minHeight: 260, position: "relative" }}>
        <Box
          sx={{
            opacity: isFetching ? 0.72 : 1,
            transform: isFetching ? "translateY(2px)" : "translateY(0)",
            transition: "opacity 180ms ease, transform 180ms ease",
          }}
        >
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

function PatientsHeader({ total }: { total?: number }) {
  return (
    <Stack
      direction={{ xs: "column", sm: "row" }}
      spacing={2}
      sx={{ alignItems: { xs: "flex-start", sm: "center" }, justifyContent: "space-between" }}
    >
      <Box>
        <Typography variant="h4">Patients</Typography>
        <Typography color="text.secondary" variant="body1">
          {typeof total === "number"
            ? `${total} patient${total === 1 ? "" : "s"} found`
            : "Browse patient records"}
        </Typography>
      </Box>
      <Button component={RouterLink} to="/patients/new" variant="contained">
        Create Patient
      </Button>
    </Stack>
  );
}
