import {
  AppBar,
  Avatar,
  Box,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Toolbar,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useState } from "react";
import {
  IoChevronBack,
  IoChevronForward,
  IoHomeOutline,
  IoMenu,
  IoMoon,
  IoPeopleOutline,
  IoShieldCheckmarkOutline,
  IoSunny,
} from "react-icons/io5";
import { NavLink, Outlet } from "react-router-dom";
import { useThemeMode } from "../../theme/themeMode";

const expandedDrawerWidth = 240;
const collapsedDrawerWidth = 72;

const navItems = [
  { icon: <IoHomeOutline />, label: "Dashboard", path: "/" },
  { icon: <IoPeopleOutline />, label: "Patients", path: "/patients" },
];

function SidebarContent({
  collapsed = false,
  onNavigate,
}: {
  collapsed?: boolean;
  onNavigate?: () => void;
}) {
  return (
    <Box sx={{ py: 2 }}>
      <List>
        {navItems.map((item) => {
          const navButton = (
            <ListItemButton
              component={NavLink}
              key={item.path}
              onClick={onNavigate}
              sx={{
                borderRadius: 2,
                color: "text.secondary",
                justifyContent: collapsed ? "center" : "flex-start",
                minHeight: 48,
                mx: 1.5,
                px: collapsed ? 1.5 : 2,
                transition: (muiTheme) =>
                  muiTheme.transitions.create(["background-color", "color"], {
                    duration: muiTheme.transitions.duration.shorter,
                  }),
                "&.active": {
                  bgcolor: "primary.light",
                  color: "primary.main",
                  "& .MuiListItemIcon-root": {
                    color: "inherit",
                  },
                },
              }}
              to={item.path}
            >
              <ListItemIcon
                sx={{
                  color: "text.secondary",
                  fontSize: 22,
                  justifyContent: "center",
                  minWidth: collapsed ? 0 : 40,
                }}
              >
                {item.icon}
              </ListItemIcon>
              {!collapsed ? <ListItemText primary={item.label} /> : null}
            </ListItemButton>
          );

          return collapsed ? (
            <Tooltip key={item.path} placement="right" title={item.label}>
              {navButton}
            </Tooltip>
          ) : (
            navButton
          );
        })}
      </List>
    </Box>
  );
}

export function AppLayout() {
  const [desktopCollapsed, setDesktopCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const { mode, toggleMode } = useThemeMode();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));
  const desktopDrawerWidth = desktopCollapsed ? collapsedDrawerWidth : expandedDrawerWidth;

  const closeMobileDrawer = () => setMobileOpen(false);
  const toggleMobileDrawer = () => setMobileOpen((open) => !open);
  const toggleDesktopDrawer = () => setDesktopCollapsed((collapsed) => !collapsed);

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "background.default" }}>
      <AppBar
        position="fixed"
        sx={{
          background:
            mode === "dark"
              ? "linear-gradient(90deg, #090f1f 0%, #191339 55%, #090f1f 100%)"
              : "linear-gradient(90deg, #b0b2ff 0%, #ffffff 55%, #ffffff 100%)",
          color: "text.primary",
          zIndex: (muiTheme) => muiTheme.zIndex.drawer + 1,
        }}
      >
        <Toolbar sx={{ minHeight: { xs: 64, sm: 72 } }}>
          {!isDesktop && (
            <IconButton
              aria-label="Open navigation"
              edge="start"
              onClick={toggleMobileDrawer}
              sx={{ color: "text.secondary", mr: 1.5 }}
            >
              <IoMenu />
            </IconButton>
          )}
          {isDesktop ? (
            <IconButton
              aria-label={desktopCollapsed ? "Expand navigation" : "Collapse navigation"}
              edge="start"
              onClick={toggleDesktopDrawer}
              sx={{ color: "text.primary", mr: 1.5 }}
            >
              {desktopCollapsed ? <IoChevronForward /> : <IoChevronBack />}
            </IconButton>
          ) : null}
          <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
            <Box
              sx={{
                alignItems: "center",
                bgcolor: "primary.light",
                borderRadius: 2,
                color: "primary.main",
                display: "flex",
                height: 36,
                justifyContent: "center",
                width: 36,
              }}
            >
              <IoShieldCheckmarkOutline size={22} />
            </Box>
            <Typography component="div" sx={{ fontWeight: 800 }} variant="h6">
              Healthcare Dashboard
            </Typography>
          </Stack>
          <Stack direction="row" spacing={1.25} sx={{ alignItems: "center", ml: "auto" }}>
            <Tooltip title={mode === "dark" ? "Switch to light mode" : "Switch to dark mode"}>
              <IconButton
                aria-label={mode === "dark" ? "Switch to light mode" : "Switch to dark mode"}
                onClick={toggleMode}
                sx={{
                  bgcolor: "background.paper",
                  border: 1,
                  borderColor: "divider",
                  color: "primary.main",
                  height: 38,
                  width: 38,
                  "&:hover": {
                    bgcolor: "primary.light",
                  },
                }}
              >
                {mode === "dark" ? <IoSunny /> : <IoMoon />}
              </IconButton>
            </Tooltip>
            <Avatar
              sx={{
                bgcolor: "primary.main",
                color: "primary.contrastText",
                fontSize: 14,
                fontWeight: 800,
                height: 36,
                width: 36,
              }}
            >
              RN
            </Avatar>
            <Box sx={{ display: { xs: "none", sm: "block" } }}>
              <Typography sx={{ fontWeight: 750, lineHeight: 1.1 }} variant="body2">
                Care Team
              </Typography>
              <Typography color="text.secondary" sx={{ lineHeight: 1.1 }} variant="caption">
                RN
              </Typography>
            </Box>
          </Stack>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{
          flexShrink: { md: 0 },
          width: { md: desktopDrawerWidth },
        }}
      >
        <Drawer
          ModalProps={{ keepMounted: true }}
          onClose={closeMobileDrawer}
          open={mobileOpen}
          sx={{
            display: { xs: "block", md: "none" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              borderColor: "divider",
              width: expandedDrawerWidth,
            },
          }}
          variant="temporary"
        >
          <Toolbar />
          <SidebarContent onNavigate={closeMobileDrawer} />
        </Drawer>

        <Drawer
          open
          sx={{
            display: { xs: "none", md: "block" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              borderColor: "divider",
              overflowX: "hidden",
              transition: (muiTheme) =>
                muiTheme.transitions.create("width", {
                  duration: muiTheme.transitions.duration.shorter,
                  easing: muiTheme.transitions.easing.sharp,
                }),
              width: desktopDrawerWidth,
            },
          }}
          variant="permanent"
        >
          <Toolbar />
          <SidebarContent collapsed={desktopCollapsed} />
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minWidth: 0,
          p: { xs: 2, sm: 3, lg: 4 },
          transition: (muiTheme) =>
            muiTheme.transitions.create("width", {
              duration: muiTheme.transitions.duration.shorter,
              easing: muiTheme.transitions.easing.sharp,
            }),
          width: { md: `calc(100% - ${desktopDrawerWidth}px)` },
        }}
      >
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
}
