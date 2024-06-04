import { AppBar, Toolbar, IconButton, Typography } from "@mui/material";

function Navbar() {
  return (
    <div>
      <AppBar position="static">
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
          >
            {/* <MeetingRoomIcon /> */}
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            MeetTime
          </Typography>
        </Toolbar>
      </AppBar>
    </div>
  );
}

export default Navbar;
