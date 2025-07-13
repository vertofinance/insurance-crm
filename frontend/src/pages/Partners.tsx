import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const Partners: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
        Insurance Partners
      </Typography>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Partner Management
        </Typography>
        <Typography color="text.secondary">
          Insurance partner management interface will be implemented here.
        </Typography>
      </Paper>
    </Box>
  );
};

export default Partners; 