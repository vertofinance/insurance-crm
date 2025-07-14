import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Alert,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  InputAdornment,
  FormHelperText,
  Avatar,
  Divider
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  TrendingUp as TrendingIcon,
  AttachMoney as MoneyIcon,
  Person as PersonIcon,
  Description as PolicyIcon,
  CalendarToday as DateIcon,
  FilterList as FilterIcon
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
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface Sale {
  id: string;
  amount: number;
  commission: number;
  saleDate: string;
  policy: {
    id: string;
    policyNumber: string;
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
  };
  salesAgent: {
    id: string;
    firstName: string;
    lastName: string;
  };
  customer: {
    firstName: string;
    lastName: string;
    companyName?: string;
  };
}

interface SalesAgent {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface SalesStats {
  totalSales: number;
  totalCommission: number;
  totalPolicies: number;
  averageSale: number;
  monthlyTrend: Array<{
    month: string;
    sales: number;
    commission: number;
  }>;
  topAgents: Array<{
    agentName: string;
    sales: number;
    commission: number;
  }>;
  categoryBreakdown: Array<{
    category: string;
    sales: number;
    count: number;
  }>;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

const Sales: React.FC = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [agents, setAgents] = useState<SalesAgent[]>([]);
  const [stats, setStats] = useState<SalesStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAgent, setFilterAgent] = useState('all');
  const [filterDateRange, setFilterDateRange] = useState('all');
  const [showStats, setShowStats] = useState(true);

  useEffect(() => {
    fetchSales();
    fetchAgents();
    fetchSalesStats();
  }, []);

  const fetchSales = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3001/api/sales', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch sales');
      const data = await response.json();
      setSales(data);
    } catch (err) {
      setError('Failed to fetch sales');
    } finally {
      setLoading(false);
    }
  };

  const fetchAgents = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/users?role=SALES_AGENT', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch agents');
      const data = await response.json();
      setAgents(data);
    } catch (err) {
      console.error('Failed to fetch agents:', err);
    }
  };

  const fetchSalesStats = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/sales/stats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch sales stats');
      const data = await response.json();
      setStats(data);
    } catch (err) {
      console.error('Failed to fetch sales stats:', err);
    }
  };

  const filteredSales = sales.filter(sale => {
    const matchesSearch = 
      sale.policy.policyNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${sale.customer.firstName} ${sale.customer.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (sale.customer.companyName && sale.customer.companyName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      sale.policy.product.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesAgent = filterAgent === 'all' || sale.salesAgent.id === filterAgent;
    
    let matchesDate = true;
    if (filterDateRange !== 'all') {
      const saleDate = new Date(sale.saleDate);
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      
      switch (filterDateRange) {
        case '30days':
          matchesDate = saleDate >= thirtyDaysAgo;
          break;
        case '90days':
          matchesDate = saleDate >= ninetyDaysAgo;
          break;
        case 'thisYear':
          matchesDate = saleDate.getFullYear() === now.getFullYear();
          break;
      }
    }
    
    return matchesSearch && matchesAgent && matchesDate;
  });

  const getCustomerName = (sale: Sale) => {
    if (sale.policy.customer.isCorporate && sale.customer.companyName) {
      return sale.customer.companyName;
    }
    return `${sale.customer.firstName} ${sale.customer.lastName}`;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          Sales Management
        </Typography>
        <Button
          variant="outlined"
          startIcon={showStats ? <FilterIcon /> : <TrendingIcon />}
          onClick={() => setShowStats(!showStats)}
        >
          {showStats ? 'Hide Analytics' : 'Show Analytics'}
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Sales Statistics */}
      {showStats && stats && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
            Sales Analytics
          </Typography>
          
          {/* Key Metrics */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center">
                    <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                      <MoneyIcon />
                    </Avatar>
                    <Box>
                      <Typography color="textSecondary" gutterBottom>
                        Total Sales
                      </Typography>
                      <Typography variant="h4">
                        ${stats.totalSales.toLocaleString()}
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
                      <TrendingIcon />
                    </Avatar>
                    <Box>
                      <Typography color="textSecondary" gutterBottom>
                        Total Commission
                      </Typography>
                      <Typography variant="h4">
                        ${stats.totalCommission.toLocaleString()}
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
                      <PolicyIcon />
                    </Avatar>
                    <Box>
                      <Typography color="textSecondary" gutterBottom>
                        Policies Sold
                      </Typography>
                      <Typography variant="h4">
                        {stats.totalPolicies.toLocaleString()}
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
                      <PersonIcon />
                    </Avatar>
                    <Box>
                      <Typography color="textSecondary" gutterBottom>
                        Avg. Sale
                      </Typography>
                      <Typography variant="h4">
                        ${stats.averageSale.toLocaleString()}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Charts */}
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Monthly Sales Trend
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={stats.monthlyTrend}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, '']} />
                      <Legend />
                      <Line type="monotone" dataKey="sales" stroke="#8884d8" name="Sales" />
                      <Line type="monotone" dataKey="commission" stroke="#82ca9d" name="Commission" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Sales by Category
                  </Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={stats.categoryBreakdown}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="sales"
                      >
                        {stats.categoryBreakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Sales']} />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Paper>
      )}

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Search sales..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>Sales Agent</InputLabel>
              <Select
                value={filterAgent}
                onChange={(e) => setFilterAgent(e.target.value)}
                label="Sales Agent"
              >
                <MenuItem value="all">All Agents</MenuItem>
                {agents.map(agent => (
                  <MenuItem key={agent.id} value={agent.id}>
                    {agent.firstName} {agent.lastName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>Date Range</InputLabel>
              <Select
                value={filterDateRange}
                onChange={(e) => setFilterDateRange(e.target.value)}
                label="Date Range"
              >
                <MenuItem value="all">All Time</MenuItem>
                <MenuItem value="30days">Last 30 Days</MenuItem>
                <MenuItem value="90days">Last 90 Days</MenuItem>
                <MenuItem value="thisYear">This Year</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <Typography variant="body2" color="text.secondary">
              {filteredSales.length} sale{filteredSales.length !== 1 ? 's' : ''}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Sales Table */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Policy Number</strong></TableCell>
                <TableCell><strong>Customer</strong></TableCell>
                <TableCell><strong>Product</strong></TableCell>
                <TableCell><strong>Sales Agent</strong></TableCell>
                <TableCell><strong>Sale Date</strong></TableCell>
                <TableCell><strong>Amount</strong></TableCell>
                <TableCell><strong>Commission</strong></TableCell>
                <TableCell><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredSales.map((sale) => (
                <TableRow key={sale.id} hover>
                  <TableCell>
                    <Box display="flex" alignItems="center">
                      <PolicyIcon sx={{ mr: 1, fontSize: 20, color: 'primary.main' }} />
                      {sale.policy.policyNumber}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center">
                      <PersonIcon sx={{ mr: 1, fontSize: 20, color: 'secondary.main' }} />
                      {getCustomerName(sale)}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={sale.policy.product.category} 
                      size="small" 
                      color="primary" 
                      variant="outlined"
                    />
                    <Typography variant="body2" color="text.secondary">
                      {sale.policy.product.name}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {sale.salesAgent.firstName} {sale.salesAgent.lastName}
                  </TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center">
                      <DateIcon sx={{ mr: 1, fontSize: 16, color: 'text.secondary' }} />
                      {new Date(sale.saleDate).toLocaleDateString()}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="primary" fontWeight="bold">
                      ${sale.amount.toLocaleString()}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="success.main" fontWeight="bold">
                      ${sale.commission.toLocaleString()}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <IconButton size="small" color="primary">
                      <EditIcon />
                    </IconButton>
                    <IconButton size="small" color="error">
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default Sales; 