import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const Customers: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
        Customer Management
      </Typography>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Customer List
        </Typography>
        <Typography color="text.secondary">
          Customer management interface will be implemented here with data grid, search, and CRUD operations.
        </Typography>
      </Paper>
    </Box>
  );
};

export default Customers; 