import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const Products: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
        Insurance Products
      </Typography>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Product Management
        </Typography>
        <Typography color="text.secondary">
          Insurance product management interface will be implemented here.
        </Typography>
      </Paper>
    </Box>
  );
};

export default Products; 