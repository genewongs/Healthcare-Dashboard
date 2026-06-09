import { IconButton } from "@mui/material";
import { IoArrowBackCircleOutline, IoChevronBackCircleSharp } from "react-icons/io5";
import { Link as RouterLink } from "react-router-dom";

type CircularBackButtonProps = {
  ariaLabel?: string;
  to: string;
};

export function CircularBackButton({
  ariaLabel = "Go back",
  to,
}: CircularBackButtonProps) {
  return (
    <IconButton
      aria-label={ariaLabel}
      component={RouterLink}
      sx={{
        color: "primary.main",
        p: 0,
      }}
      to={to}
    >
      <IoArrowBackCircleOutline size={30} />
    </IconButton>
  );
}
