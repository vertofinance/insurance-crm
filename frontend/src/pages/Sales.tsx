import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const Sales: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
        Sales Management
      </Typography>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Sales Tracking
        </Typography>
        <Typography color="text.secondary">
          Sales management and performance tracking interface will be implemented here.
        </Typography>
      </Paper>
    </Box>
  );
};

export default Sales; 