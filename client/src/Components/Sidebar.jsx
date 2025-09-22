import React from 'react';
import { Drawer, Toolbar, List, ListItemButton, ListItemText, Box, Divider } from '@mui/material';

const Sidebar = ({ items = [], selectedId, onSelect, width = 240, title = 'Menu' }) => {
  return (
    <Drawer
      variant="permanent"
      anchor="left"
      sx={{
        width,
        flexShrink: 0,
        '& .MuiDrawer-paper': { width, boxSizing: 'border-box' },
      }}
    >
      {/* Keeps content below the AppBar */}
      <Toolbar />
      <Box sx={{ overflow: 'auto' }}>
        <List subheader={<Box sx={{ px: 2, py: 1, fontWeight: 600 }}>{title}</Box>}>
          {items.map((item) => (
            <ListItemButton
              key={item.id}
              selected={selectedId === item.id}
              onClick={() => onSelect?.(item)}
            >
              <ListItemText primary={item.label} secondary={item.secondary} />
            </ListItemButton>
          ))}
        </List>
        <Divider />
      </Box>
    </Drawer>
  );
};

export default Sidebar;
