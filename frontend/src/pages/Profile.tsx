import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const Profile: React.FC = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
        User Profile
      </Typography>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Profile Settings
        </Typography>
        <Typography color="text.secondary">
          User profile management and settings interface will be implemented here.
        </Typography>
      </Paper>
    </Box>
  );
};

export default Profile; 