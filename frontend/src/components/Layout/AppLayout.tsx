import {
  AppBar,
  Box,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
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
  IoPeopleOutline,
} from "react-icons/io5";
import { NavLink, Outlet } from "react-router-dom";

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
                borderRadius: 1,
                justifyContent: collapsed ? "center" : "flex-start",
                minHeight: 44,
                mx: 1,
                px: collapsed ? 1.5 : 2,
                "&.active": {
                  bgcolor: "primary.main",
                  color: "primary.contrastText",
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
          zIndex: (muiTheme) => muiTheme.zIndex.drawer + 1,
        }}
      >
        <Toolbar>
          {!isDesktop && (
            <IconButton
              aria-label="Open navigation"
              color="inherit"
              edge="start"
              onClick={toggleMobileDrawer}
              sx={{ mr: 2 }}
            >
              <IoMenu />
            </IconButton>
          )}
          {isDesktop ? (
            <IconButton
              aria-label={desktopCollapsed ? "Expand navigation" : "Collapse navigation"}
              color="inherit"
              edge="start"
              onClick={toggleDesktopDrawer}
              sx={{ mr: 2 }}
            >
              {desktopCollapsed ? <IoChevronForward /> : <IoChevronBack />}
            </IconButton>
          ) : null}
          <Typography component="div" variant="h6">
            Healthcare Dashboard
          </Typography>
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
          p: { xs: 2, sm: 3 },
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
