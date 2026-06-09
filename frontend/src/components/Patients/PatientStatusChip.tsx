import { Chip, type ChipProps } from "@mui/material";
import type { PatientStatus } from "../../types/patient";

type PatientStatusChipProps = {
  status: PatientStatus;
};

const statusColors: Record<PatientStatus, ChipProps["color"]> = {
  active: "primary",
  inactive: "error",
  discharged: "default",
  pending: "warning",
};

export function formatPatientStatusLabel(status: PatientStatus) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export function PatientStatusChip({ status }: PatientStatusChipProps) {
  return (
    <Chip color={statusColors[status]} label={formatPatientStatusLabel(status)} size="small" />
  );
}
