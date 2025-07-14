import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  CircularProgress,
  Alert,
  Divider
} from '@mui/material';
import {
  People as PeopleIcon,
  Description as PolicyIcon,
  AttachMoney as RevenueIcon,
  TrendingUp as TrendingIcon,
  Warning as WarningIcon,
  CheckCircle as ActiveIcon,
  Schedule as PendingIcon,
  Cancel as CancelledIcon
} from '@mui/icons-material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface DashboardData {
  overview: {
    totalCustomers: number;
    totalPolicies: number;
    activePolicies: number;
    totalSales: number;
    totalRevenue: number;
    totalCommission: number;
  };
  recentPolicies: Array<{
    id: string;
    policyNumber: string;
    status: string;
    premium: number;
    customer: {
      firstName: string;
      lastName: string;
      companyName?: string;
      isCorporate: boolean;
    };
    product: {
      name: string;
      category: string;
    };
  }>;
  policyStatuses: Array<{
    status: string;
    _count: {
      status: number;
    };
  }>;
  monthlySales: Array<{
    saleDate: string;
    _sum: {
      amount: number;
    };
    _count: {
      id: number;
    };
  }>;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const Dashboard: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      const response = await fetch('http://localhost:3001/api/dashboard/overview', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch dashboard data');

            const data = await response.json();
      setData(data);
    } catch (err) {
      setError('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'success';
      case 'PENDING':
        return 'warning';
      case 'EXPIRED':
        return 'error';
      case 'CANCELLED':
        return 'default';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <ActiveIcon />;
      case 'PENDING':
        return <PendingIcon />;
      case 'EXPIRED':
        return <WarningIcon />;
      case 'CANCELLED':
        return <CancelledIcon />;
      default:
        return <PolicyIcon />;
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  if (!data) {
    return null;
  }

  const chartData = data.monthlySales.map(item => ({
    month: new Date(item.saleDate).toLocaleDateString('en-US', { month: 'short' }),
    revenue: item._sum.amount,
    policies: item._count.id
  }));

  const pieData = data.policyStatuses.map(item => ({
    name: item.status,
    value: item._count.status
  }));

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
        Dashboard Overview
      </Typography>

      {/* Key Metrics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                  <PeopleIcon />
                </Avatar>
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Total Customers
                  </Typography>
                  <Typography variant="h4">
                    {data.overview.totalCustomers.toLocaleString()}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Avatar sx={{ bgcolor: 'success.main', mr: 2 }}>
                  <PolicyIcon />
                </Avatar>
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Active Policies
                  </Typography>
                  <Typography variant="h4">
                    {data.overview.activePolicies.toLocaleString()}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Avatar sx={{ bgcolor: 'warning.main', mr: 2 }}>
                  <RevenueIcon />
                </Avatar>
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Total Revenue
                  </Typography>
                  <Typography variant="h4">
                    ${(data.overview.totalRevenue / 1000).toFixed(0)}K
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center">
                <Avatar sx={{ bgcolor: 'info.main', mr: 2 }}>
                  <TrendingIcon />
                </Avatar>
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Commission Earned
                  </Typography>
                  <Typography variant="h4">
                    ${(data.overview.totalCommission / 1000).toFixed(0)}K
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts Row */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Monthly Revenue Trend
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Revenue']} />
                <Legend />
                <Bar dataKey="revenue" fill="#8884d8" name="Revenue" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Policy Status Distribution
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* Recent Policies */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Recent Policies
            </Typography>
            <List>
              {data.recentPolicies.map((policy, index) => (
                <React.Fragment key={policy.id}>
                  <ListItem alignItems="flex-start">
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        {getStatusIcon(policy.status)}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography variant="subtitle1">
                            {policy.policyNumber}
                          </Typography>
                          <Chip
                            label={policy.status}
                            color={getStatusColor(policy.status) as any}
                            size="small"
                          />
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            {policy.customer.isCorporate 
                              ? policy.customer.companyName 
                              : `${policy.customer.firstName} ${policy.customer.lastName}`
                            }
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {policy.product.name} - ${policy.premium}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                  {index < data.recentPolicies.length - 1 && <Divider variant="inset" component="li" />}
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            <List>
              <ListItem button>
                <ListItemText primary="Create New Policy" secondary="Add a new insurance policy" />
              </ListItem>
              <ListItem button>
                <ListItemText primary="Add Customer" secondary="Register a new customer" />
              </ListItem>
              <ListItem button>
                <ListItemText primary="View Reports" secondary="Generate performance reports" />
              </ListItem>
              <ListItem button>
                <ListItemText primary="Manage Users" secondary="Add or modify user accounts" />
              </ListItem>
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard; 