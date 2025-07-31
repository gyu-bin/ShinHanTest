import React from 'react';
import { Box, CssBaseline, Drawer, AppBar, Toolbar, Typography } from '@mui/material';
import SidebarMenu from './SidebarMenu';

const drawerWidth = 240;

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <Box sx={{ display: 'flex', height: '100vh', background: '#f7fafd' }}>
      <CssBaseline />
      <AppBar position="fixed" sx={{ zIndex: 1201, background: '#fff', color: '#222', boxShadow: 'none', borderBottom: '1px solid #e0e0e0' }}>
        <Toolbar>
          <Typography variant="h6" noWrap component="div" sx={{ color: '#1976d2', fontWeight: 700 }}>
            신한은행
          </Typography>
          <Typography sx={{ ml: 2, color: '#888', fontSize: 14 }}>
            행원명/부서 | 업무메뉴 입력해 주세요
          </Typography>
          <Box sx={{ flexGrow: 1 }} />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <input placeholder="대출 상품 추천" style={{ padding: '6px 12px', borderRadius: 4, border: '1px solid #e0e0e0', fontSize: 14 }} />
            <Box sx={{ width: 32, height: 32, borderRadius: '50%', background: '#e3f2fd', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1976d2', fontWeight: 700 }}>알림</Box>
          </Box>
        </Toolbar>
      </AppBar>
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box', background: '#f7fafd', borderRight: '1px solid #e0e0e0' },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto', p: 2 }}>
          <SidebarMenu />
        </Box>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: 4, mt: 8 }}>
        {children}
      </Box>
    </Box>
  );
};

export default Layout; 