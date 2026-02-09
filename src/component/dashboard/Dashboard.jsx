import React, { useEffect, useState } from "react";
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  CssBaseline,
  Box,
  Avatar,
  Divider,
  styled,
  useMediaQuery,
  useTheme,
  Menu,
  MenuItem
} from "@mui/material";
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Notifications as NotificationsIcon,
  Logout as LogoutIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  AccountCircle as AccountCircleIcon,
  Category as CategoryIcon,
  Inventory2 as InventoryIcon,
  LocalShipping as LocalShippingIcon,
  PointOfSale as PointOfSaleIcon,
  Store as StoreIcon,
} from "@mui/icons-material";
import FactoryIcon from '@mui/icons-material/Factory';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import { blue, indigo } from "@mui/material/colors";
import './dashboard.scss';
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { getTotalSolde } from "../../services/soldeService";

const drawerWidth = 240;

const Main = styled("main", { shouldForwardProp: (prop) => prop !== "open" })(
  ({ theme, open }) => ({
    flexGrow: 1,
    padding: theme.spacing(3),
    transition: theme.transitions.create("margin", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    marginLeft: `-${drawerWidth}px`,
    backgroundColor: 'white',   // <-- ajout ici
    ...(open && {
      transition: theme.transitions.create("margin", {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
      marginLeft: 0,
    }),
  })
);


const AppBarStyled = styled(AppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  background: "white",
  color: theme.palette.text.primary,
  boxShadow: "none",
  borderBottom: `1px solid ${theme.palette.divider}`,
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(["width", "margin"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
  justifyContent: "flex-end",
}));

const GradientAvatar = styled(Avatar)(({ theme }) => ({
  background: `linear-gradient(135deg, ${blue[500]}, ${indigo[500]})`,
  width: 56,
  height: 56,
}));

const Dashboard = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [open, setOpen] = useState(!isMobile);
  const navigate = useNavigate();
  const location = useLocation();
  const [totalSolde, setTotalSolde] = useState(null)

  // Menus
  const [accountAnchorEl, setAccountAnchorEl] = useState(null);
  const [siteAnchorEl, setSiteAnchorEl] = useState(null);
  const isAccountMenuOpen = Boolean(accountAnchorEl);
  const isSiteMenuOpen = Boolean(siteAnchorEl);

  // Mobile menu (non modifié)
  const [mobileMoreAnchorEl, setMobileMoreAnchorEl] = useState(null);
  const isMobileMenuOpen = Boolean(mobileMoreAnchorEl);

  const handleDrawerToggle = () => setOpen(!open);

  const handleAccountMenuOpen = (event) => {
    setAccountAnchorEl(event.currentTarget);
  };

  const handleAccountMenuClose = () => {
    setAccountAnchorEl(null);
  };

  const handleSiteMenuOpen = (event) => {
    setSiteAnchorEl(event.currentTarget);
  };

  const handleSiteMenuClose = () => {
    setSiteAnchorEl(null);
  };

  const handleMobileMenuOpen = (event) => {
    setMobileMoreAnchorEl(event.currentTarget);
  };

  const handleMobileMenuClose = () => {
    setMobileMoreAnchorEl(null);
  };


  const logout = async () => {
    sessionStorage.clear();
    navigate("/login/admin");
  };

  useEffect(() => {
    (async () => {
      const totalSolde = await getTotalSolde();
      const formated = new Intl.NumberFormat('fr-FR').format(totalSolde);
      console.log(formated);
      setTotalSolde(formated);
    })()
  }, []);


  const renderMenu = (
    <Menu
      anchorEl={accountAnchorEl}
      open={isAccountMenuOpen}
      onClose={handleAccountMenuClose}
      anchorOrigin={{ vertical: "top", horizontal: "right" }}
      transformOrigin={{ vertical: "top", horizontal: "right" }}
    >
      <MenuItem onClick={logout}>
        <ListItemIcon>
          <LogoutIcon fontSize="small" />
        </ListItemIcon>
        Déconnexion
      </MenuItem>
    </Menu>
  );

  const mobileMenuId = "primary-search-account-menu-mobile";
  const renderMobileMenu = (
    <Menu
      anchorEl={mobileMoreAnchorEl}
      id={mobileMenuId}
      keepMounted
      open={isMobileMenuOpen}
      onClose={handleMobileMenuClose}
      anchorOrigin={{ vertical: "top", horizontal: "right" }}
      transformOrigin={{ vertical: "top", horizontal: "right" }}
    >
      <MenuItem onClick={handleAccountMenuOpen}>
        <IconButton size="large" color="inherit">
          <AccountCircleIcon />
        </IconButton>
        <p>Profile</p>
      </MenuItem>
    </Menu>
  );

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      {renderMobileMenu}
      {renderMenu}

      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
            borderRight: "none",
            background: "#f8fafc",
          },
        }}
        variant={isMobile ? "temporary" : "persistent"}
        anchor="left"
        open={open}
        onClose={handleDrawerToggle}
      >
        <DrawerHeader>
          <Box sx={{ display: "flex", alignItems: "center", width: "100%", p: 2 }}>
            <Box sx={{ ml: 2 }}>
              <Typography variant="caption" color="text.secondary">
                TABLEAU DE BORD
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={handleDrawerToggle}>
            {theme.direction === "ltr" ? <ChevronLeftIcon /> : <ChevronRightIcon />}
          </IconButton>
        </DrawerHeader>

        <Divider />
        <List>
          {[
            { text: "Transaction", icon: <DashboardIcon />, path: "/transactions" },
            { text: "Historique transaction", icon: <AccountBalanceIcon />, path: "/transactions-historique" },
            { text: "Comptes d\'envoi", icon: <CategoryIcon />, path: "/comptes-envoi" },
            { text: "Type de Crypto Money", icon: <InventoryIcon />, path: "/type-crypto" },
            { text: "Historique", icon: <PeopleIcon />, path: "/soldes-users" },
            { text: "Historique Main", icon: <PeopleIcon />, path: "/histo-main" },
          ].map((item) => (
            <ListItem
              button
              key={item.text}
              onClick={() => navigate(item.path)}
              sx={{
                borderRadius: 2,
                mx: 1,
                my: 0.5,
                backgroundColor: location.pathname === item.path ? "#e3f2fd" : "transparent",
                cursor: 'pointer'
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItem>
          ))}
        </List>
        <Divider />
        <List>
          <ListItem button sx={{ borderRadius: 2, mx: 1, my: 0.5, cursor: 'pointer' }} onClick={logout}>
            <ListItemIcon sx={{ minWidth: 40 }}>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText primary="Déconnexion" />
          </ListItem>
        </List>
      </Drawer>

      <AppBarStyled position="fixed" open={open}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerToggle}
            edge="start"
            sx={{ mr: 2, ...(open && { display: "none" }) }}
          >
            <MenuIcon />
          </IconButton>

          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            AFRIPOKS
          </Typography>

          <Box sx={{ display: { xs: "none", md: "flex" }, alignItems: 'center' }}>
            <div style={{ marginRight: '48pt', color: '#555' }}>
              <span style={{ marginRight: '8px' }}>Total solde :</span>
              <span style={{ 
                color: '#009225ff', 
                fontWeight: 'bold', 
                marginRight: '4px' 
              }}>{totalSolde}</span>
              <span>Ar</span>
            </div>
            <IconButton
              size="large"
              edge="end"
              aria-label="Compte utilisateur"
              onClick={handleAccountMenuOpen}
              color="inherit"
            >
              <AccountCircleIcon />
            </IconButton>
          </Box>

          <Box sx={{ display: { xs: "flex", md: "none" } }}>
            <IconButton
              size="large"
              aria-label="show more"
              aria-controls={mobileMenuId}
              aria-haspopup="true"
              onClick={handleMobileMenuOpen}
              color="inherit"
            >
              <NotificationsIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBarStyled>

      <Main open={open} sx={{ backgroundColor: 'white', height: '100vh' }}>
        <DrawerHeader />
        <Outlet />
      </Main>
    </Box>
  );
};

export default Dashboard;
