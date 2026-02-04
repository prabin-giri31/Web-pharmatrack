import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    FiFileText, FiPlus, FiSearch, FiFilter, FiDollarSign, 
    FiClock, FiCheckCircle, FiAlertTriangle, FiMoreVertical,
    FiEdit2, FiTrash2, FiEye, FiCalendar, FiRefreshCw
} from 'react-icons/fi';
import { API_ENDPOINTS, apiRequest } from '../../config/api';

const BillsPage = () => {
    const navigate = useNavigate();
    const [bills, setBills] = useState([]);
    const [stats, setStats] = useState({
        totalBills: 0,
        openBills: 0,
        paidBills: 0,
        overdueBills: 0,
        totalAmount: 0,
        balanceDue: 0
    });
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [showMenu, setShowMenu] = useState(null);
    const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });

    useEffect(() => {
        fetchBills();
        fetchStats();
    }, [searchTerm, statusFilter, pagination.page]);

    const fetchBills = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                page: pagination.page,
                limit: pagination.limit,
                ...(searchTerm && { search: searchTerm }),
                ...(statusFilter && { status: statusFilter })
            });
            
            const response = await apiRequest(`${API_ENDPOINTS.bills}?${params}`);
            if (response.success) {
                setBills(response.data.data || []);
                setPagination(prev => ({ ...prev, total: response.data.pagination?.total || 0 }));
            }
        } catch (error) {
            console.error('Error fetching bills:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await apiRequest(`${API_ENDPOINTS.bills}/stats`);
            if (response.success) {
                setStats(response.data.data || stats);
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this bill?')) {
            try {
                const response = await apiRequest(`${API_ENDPOINTS.bills}/${id}`, {
                    method: 'DELETE'
                });
                if (response.success) {
                    fetchBills();
                    fetchStats();
                }
            } catch (error) {
                console.error('Error deleting bill:', error);
            }
        }
        setShowMenu(null);
    };

    const getStatusBadge = (status) => {
        const badges = {
            draft: { bg: 'bg-gray-100', text: 'text-gray-700', icon: FiFileText },
            open: { bg: 'bg-blue-100', text: 'text-blue-700', icon: FiClock },
            partially_paid: { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: FiDollarSign },
            paid: { bg: 'bg-green-100', text: 'text-green-700', icon: FiCheckCircle },
            overdue: { bg: 'bg-red-100', text: 'text-red-700', icon: FiAlertTriangle },
            cancelled: { bg: 'bg-gray-100', text: 'text-gray-500', icon: FiFileText }
        };
        const badge = badges[status] || badges.draft;
        const Icon = badge.icon;
        
        return (
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
                <Icon className="w-3 h-3" />
                {status?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </span>
        );
    };

    const formatCurrency = (amount) => {
        return `Rs. ${parseFloat(amount || 0).toLocaleString('en-NP', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const StatCard = ({ icon: Icon, title, value, subtitle, gradient }) => (
        <div className={`relative overflow-hidden rounded-2xl p-6 text-white ${gradient}`}>
            <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-white/10" />
            <div className="relative">
                <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-xl bg-white/20`}>
                        <Icon className="w-6 h-6" />
                    </div>
                </div>
                <div className="text-3xl font-bold mb-1">{value}</div>
                <div className="text-sm opacity-80">{title}</div>
                {subtitle && <div className="text-xs opacity-60 mt-1">{subtitle}</div>}
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/30 p-6">
            {/* Header */}
            <div className="mb-8">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 bg-clip-text text-transparent">
                            Bills
                        </h1>
                        <p className="text-gray-500 mt-1">Manage and track vendor bills</p>
                    </div>
                    <button
                        onClick={() => navigate('/purchases/bills/new')}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-200 hover:-translate-y-0.5"
                    >
                        <FiPlus className="w-5 h-5" />
                        New Bill
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard
                    icon={FiFileText}
                    title="Total Bills"
                    value={stats.totalBills}
                    gradient="bg-gradient-to-br from-blue-500 to-blue-600"
                />
                <StatCard
                    icon={FiClock}
                    title="Open Bills"
                    value={stats.openBills}
                    subtitle={formatCurrency(stats.balanceDue) + ' due'}
                    gradient="bg-gradient-to-br from-amber-500 to-orange-500"
                />
                <StatCard
                    icon={FiCheckCircle}
                    title="Paid Bills"
                    value={stats.paidBills}
                    gradient="bg-gradient-to-br from-emerald-500 to-green-600"
                />
                <StatCard
                    icon={FiAlertTriangle}
                    title="Overdue Bills"
                    value={stats.overdueBills}
                    gradient="bg-gradient-to-br from-red-500 to-rose-600"
                />
            </div>

            {/* Filters */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search bills by number or vendor..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                        />
                    </div>
                    <div className="flex gap-3">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                        >
                            <option value="">All Status</option>
                            <option value="draft">Draft</option>
                            <option value="open">Open</option>
                            <option value="partially_paid">Partially Paid</option>
                            <option value="paid">Paid</option>
                            <option value="overdue">Overdue</option>
                        </select>
                        <button
                            onClick={() => { fetchBills(); fetchStats(); }}
                            className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors"
                        >
                            <FiRefreshCw className="w-5 h-5 text-gray-600" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Bills List */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {loading ? (
                    <div className="p-12 text-center">
                        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4" />
                        <p className="text-gray-500">Loading bills...</p>
                    </div>
                ) : bills.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FiFileText className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No bills found</h3>
                        <p className="text-gray-500 mb-6">Get started by creating your first bill</p>
                        <button
                            onClick={() => navigate('/purchases/bills/new')}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
                        >
                            <FiPlus className="w-5 h-5" />
                            Create Bill
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Desktop Table */}
                        <div className="hidden lg:block overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-100">
                                    <tr>
                                        <th className="text-left py-4 px-6 font-semibold text-gray-700">Bill #</th>
                                        <th className="text-left py-4 px-6 font-semibold text-gray-700">Vendor</th>
                                        <th className="text-left py-4 px-6 font-semibold text-gray-700">Bill Date</th>
                                        <th className="text-left py-4 px-6 font-semibold text-gray-700">Due Date</th>
                                        <th className="text-right py-4 px-6 font-semibold text-gray-700">Amount</th>
                                        <th className="text-right py-4 px-6 font-semibold text-gray-700">Balance</th>
                                        <th className="text-center py-4 px-6 font-semibold text-gray-700">Status</th>
                                        <th className="text-center py-4 px-6 font-semibold text-gray-700">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {bills.map((bill) => (
                                        <tr key={bill.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="py-4 px-6">
                                                <span className="font-medium text-blue-600">{bill.billNumber}</span>
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-sm">
                                                        {bill.supplier?.companyName?.charAt(0) || 'V'}
                                                    </div>
                                                    <div>
                                                        <div className="font-medium text-gray-900">{bill.supplier?.companyName || 'Unknown'}</div>
                                                        <div className="text-sm text-gray-500">{bill.supplier?.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6 text-gray-600">{formatDate(bill.billDate)}</td>
                                            <td className="py-4 px-6 text-gray-600">{formatDate(bill.dueDate)}</td>
                                            <td className="py-4 px-6 text-right font-semibold text-gray-900">{formatCurrency(bill.grandTotal)}</td>
                                            <td className="py-4 px-6 text-right">
                                                <span className={`font-semibold ${bill.balanceDue > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                                    {formatCurrency(bill.balanceDue)}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6 text-center">{getStatusBadge(bill.status)}</td>
                                            <td className="py-4 px-6">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button
                                                        onClick={() => navigate(`/purchases/bills/${bill.id}`)}
                                                        className="p-2 hover:bg-blue-50 rounded-lg transition-colors text-blue-600"
                                                        title="View"
                                                    >
                                                        <FiEye className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => navigate(`/purchases/bills/${bill.id}/edit`)}
                                                        className="p-2 hover:bg-green-50 rounded-lg transition-colors text-green-600"
                                                        title="Edit"
                                                    >
                                                        <FiEdit2 className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(bill.id)}
                                                        className="p-2 hover:bg-red-50 rounded-lg transition-colors text-red-600"
                                                        title="Delete"
                                                    >
                                                        <FiTrash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Cards */}
                        <div className="lg:hidden divide-y divide-gray-100">
                            {bills.map((bill) => (
                                <div key={bill.id} className="p-4 hover:bg-gray-50 transition-colors">
                                    <div className="flex items-start justify-between mb-3">
                                        <div>
                                            <span className="font-semibold text-blue-600">{bill.billNumber}</span>
                                            <div className="text-sm text-gray-500 mt-1">{bill.supplier?.companyName}</div>
                                        </div>
                                        {getStatusBadge(bill.status)}
                                    </div>
                                    <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                                        <div>
                                            <span className="text-gray-500">Bill Date:</span>
                                            <span className="ml-2 font-medium">{formatDate(bill.billDate)}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-500">Due:</span>
                                            <span className="ml-2 font-medium">{formatDate(bill.dueDate)}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                                        <div>
                                            <div className="text-lg font-bold text-gray-900">{formatCurrency(bill.grandTotal)}</div>
                                            <div className={`text-sm ${bill.balanceDue > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                                Balance: {formatCurrency(bill.balanceDue)}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => navigate(`/purchases/bills/${bill.id}`)}
                                                className="p-2 bg-blue-50 rounded-lg text-blue-600"
                                            >
                                                <FiEye className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => navigate(`/purchases/bills/${bill.id}/edit`)}
                                                className="p-2 bg-green-50 rounded-lg text-green-600"
                                            >
                                                <FiEdit2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>

            {/* Pagination */}
            {pagination.total > pagination.limit && (
                <div className="flex items-center justify-between mt-6">
                    <p className="text-sm text-gray-600">
                        Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} bills
                    </p>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                            disabled={pagination.page === 1}
                            className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Previous
                        </button>
                        <button
                            onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                            disabled={pagination.page * pagination.limit >= pagination.total}
                            className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BillsPage;
