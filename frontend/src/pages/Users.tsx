import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const Users: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
        User Management
      </Typography>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          User Administration
        </Typography>
        <Typography color="text.secondary">
          User management interface will be implemented here with role-based access control.
        </Typography>
      </Paper>
    </Box>
  );
};

export default Users; 