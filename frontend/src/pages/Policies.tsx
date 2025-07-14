import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  IconButton,
  Chip,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Card,
  CardContent,
  Tooltip
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  CheckCircle as ActiveIcon,
  Schedule as PendingIcon,
  Warning as ExpiredIcon,
  Cancel as CancelledIcon,
  PlayArrow as ActivateIcon,
  Stop as CancelIcon
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

interface Policy {
  id: string;
  policyNumber: string;
  status: 'DRAFT' | 'PENDING' | 'ACTIVE' | 'EXPIRED' | 'CANCELLED';
  premium: number;
  commission: number;
  startDate: string;
  endDate: string;
  customer: {
    id: string;
    firstName: string;
    lastName: string;
    companyName?: string;
    isCorporate: boolean;
  };
  product: {
    id: string;
    name: string;
    category: string;
  };
  salesAgent: {
    id: string;
    firstName: string;
    lastName: string;
  };
  createdAt: string;
}

interface PolicyFormData {
  customerId: string;
  productId: string;
  premium: number;
  startDate: string;
  endDate: string;
  policyNumber: string;
}

const Policies: React.FC = () => {
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState<Policy | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalPolicies, setTotalPolicies] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterProduct, setFilterProduct] = useState('');

  const { user } = useSelector((state: RootState) => state.auth);

  const [formData, setFormData] = useState<PolicyFormData>({
    customerId: '',
    productId: '',
    premium: 0,
    startDate: '',
    endDate: '',
    policyNumber: ''
  });

  useEffect(() => {
    fetchPolicies();
    fetchCustomers();
    fetchProducts();
  }, [page, rowsPerPage, searchTerm, filterStatus, filterProduct]);

  const fetchPolicies = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: (page + 1).toString(),
        limit: rowsPerPage.toString()
      });

      if (searchTerm) params.append('search', searchTerm);
      if (filterStatus) params.append('status', filterStatus);
      if (filterProduct) params.append('productId', filterProduct);

      const response = await fetch(`http://localhost:3001/api/policies?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch policies');

      const data = await response.json();
      setPolicies(data.policies);
      setTotalPolicies(data.pagination.total);
    } catch (err) {
      setError('Failed to fetch policies');
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/customers?limit=100', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCustomers(data.customers);
      }
    } catch (err) {
      console.error('Failed to fetch customers');
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/products', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setProducts(data.products);
      }
    } catch (err) {
      console.error('Failed to fetch products');
    }
  };

  const handleSubmit = async () => {
    try {
      const url = editingPolicy 
        ? `http://localhost:3001/api/policies/${editingPolicy.id}`
        : 'http://localhost:3001/api/policies';
      
      const method = editingPolicy ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error('Failed to save policy');

      setOpenDialog(false);
      setEditingPolicy(null);
      resetForm();
      fetchPolicies();
    } catch (err) {
      setError('Failed to save policy');
    }
  };

  const handleDelete = async (policyId: string) => {
    if (!window.confirm('Are you sure you want to delete this policy?')) return;

    try {
      const response = await fetch(`http://localhost:3001/api/policies/${policyId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) throw new Error('Failed to delete policy');

      fetchPolicies();
    } catch (err) {
      setError('Failed to delete policy');
    }
  };

  const handleStatusChange = async (policyId: string, newStatus: string) => {
    try {
      let endpoint = '';
      if (newStatus === 'ACTIVE') {
        endpoint = `/api/policies/${policyId}/activate`;
      } else if (newStatus === 'CANCELLED') {
        endpoint = `/api/policies/${policyId}/cancel`;
      }

      if (!endpoint) return;

      const response = await fetch(`http://localhost:3001${endpoint}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) throw new Error('Failed to update policy status');

      fetchPolicies();
    } catch (err) {
      setError('Failed to update policy status');
    }
  };

  const handleEdit = (policy: Policy) => {
    setEditingPolicy(policy);
    setFormData({
      customerId: policy.customer.id,
      productId: policy.product.id,
      premium: policy.premium,
      startDate: policy.startDate,
      endDate: policy.endDate,
      policyNumber: policy.policyNumber
    });
    setOpenDialog(true);
  };

  const resetForm = () => {
    setFormData({
      customerId: '',
      productId: '',
      premium: 0,
      startDate: '',
      endDate: '',
      policyNumber: ''
    });
  };

  const handleOpenDialog = () => {
    setEditingPolicy(null);
    resetForm();
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingPolicy(null);
    resetForm();
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
      case 'DRAFT':
        return 'info';
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
        return <ExpiredIcon />;
      case 'CANCELLED':
        return <CancelledIcon />;
      default:
        return <PendingIcon />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          Policy Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenDialog}
        >
          Create Policy
        </Button>
      </Box>

      {/* Search and Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Search policies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  label="Status"
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="DRAFT">Draft</MenuItem>
                  <MenuItem value="PENDING">Pending</MenuItem>
                  <MenuItem value="ACTIVE">Active</MenuItem>
                  <MenuItem value="EXPIRED">Expired</MenuItem>
                  <MenuItem value="CANCELLED">Cancelled</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Product</InputLabel>
                <Select
                  value={filterProduct}
                  onChange={(e) => setFilterProduct(e.target.value)}
                  label="Product"
                >
                  <MenuItem value="">All Products</MenuItem>
                  {products.map((product) => (
                    <MenuItem key={product.id} value={product.id}>
                      {product.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<FilterIcon />}
                onClick={() => {
                  setSearchTerm('');
                  setFilterStatus('');
                  setFilterProduct('');
                }}
              >
                Clear Filters
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Policies Table */}
      <Paper>
        {loading ? (
          <Box display="flex" justifyContent="center" p={4}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Policy Number</TableCell>
                    <TableCell>Customer</TableCell>
                    <TableCell>Product</TableCell>
                    <TableCell>Premium</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Agent</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {policies.map((policy) => (
                    <TableRow key={policy.id}>
                      <TableCell>
                        <Typography variant="subtitle2" fontWeight="bold">
                          {policy.policyNumber}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatDate(policy.createdAt)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {policy.customer.isCorporate 
                            ? policy.customer.companyName 
                            : `${policy.customer.firstName} ${policy.customer.lastName}`
                          }
                        </Typography>
                        {policy.customer.isCorporate && (
                          <Typography variant="caption" color="text.secondary">
                            {policy.customer.firstName} {policy.customer.lastName}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{policy.product.name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {policy.product.category}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight="bold">
                          {formatCurrency(policy.premium)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Comm: {formatCurrency(policy.commission)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={getStatusIcon(policy.status)}
                          label={policy.status}
                          color={getStatusColor(policy.status) as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {policy.salesAgent.firstName} {policy.salesAgent.lastName}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box display="flex" gap={1}>
                          <Tooltip title="Edit Policy">
                            <IconButton
                              size="small"
                              onClick={() => handleEdit(policy)}
                              color="primary"
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          
                          {policy.status === 'PENDING' && (
                            <Tooltip title="Activate Policy">
                              <IconButton
                                size="small"
                                onClick={() => handleStatusChange(policy.id, 'ACTIVE')}
                                color="success"
                              >
                                <ActivateIcon />
                              </IconButton>
                            </Tooltip>
                          )}
                          
                          {['PENDING', 'ACTIVE'].includes(policy.status) && (
                            <Tooltip title="Cancel Policy">
                              <IconButton
                                size="small"
                                onClick={() => handleStatusChange(policy.id, 'CANCELLED')}
                                color="error"
                              >
                                <CancelIcon />
                              </IconButton>
                            </Tooltip>
                          )}
                          
                          <Tooltip title="Delete Policy">
                            <IconButton
                              size="small"
                              onClick={() => handleDelete(policy.id)}
                              color="error"
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              component="div"
              count={totalPolicies}
              page={page}
              onPageChange={(_, newPage) => setPage(newPage)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(parseInt(e.target.value, 10));
                setPage(0);
              }}
            />
          </>
        )}
      </Paper>

      {/* Add/Edit Policy Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingPolicy ? 'Edit Policy' : 'Create New Policy'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Customer</InputLabel>
                <Select
                  value={formData.customerId}
                  onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                  label="Customer"
                  required
                >
                  {customers.map((customer) => (
                    <MenuItem key={customer.id} value={customer.id}>
                      {customer.isCorporate 
                        ? `${customer.companyName} (${customer.firstName} ${customer.lastName})`
                        : `${customer.firstName} ${customer.lastName}`
                      }
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Product</InputLabel>
                <Select
                  value={formData.productId}
                  onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                  label="Product"
                  required
                >
                  {products.map((product) => (
                    <MenuItem key={product.id} value={product.id}>
                      {product.name} - {product.category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Policy Number"
                value={formData.policyNumber}
                onChange={(e) => setFormData({ ...formData, policyNumber: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Premium Amount"
                type="number"
                value={formData.premium}
                onChange={(e) => setFormData({ ...formData, premium: parseFloat(e.target.value) || 0 })}
                required
                InputProps={{
                  startAdornment: '$'
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Start Date"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                required
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="End Date"
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                required
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingPolicy ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Policies; 