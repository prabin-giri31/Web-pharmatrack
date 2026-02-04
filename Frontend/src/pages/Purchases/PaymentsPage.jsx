import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    FiDollarSign, FiPlus, FiSearch, FiCreditCard, FiTrendingUp,
    FiCalendar, FiCheckCircle, FiMoreVertical, FiEye, FiTrash2,
    FiRefreshCw, FiFileText, FiBriefcase
} from 'react-icons/fi';
import { API_ENDPOINTS, apiRequest } from '../../config/api';

const PaymentsPage = () => {
    const navigate = useNavigate();
    const [payments, setPayments] = useState([]);
    const [stats, setStats] = useState({
        totalPayments: 0,
        totalAmount: 0,
        thisMonthPayments: 0,
        thisMonthAmount: 0,
        thisYearAmount: 0
    });
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [paymentModeFilter, setPaymentModeFilter] = useState('');
    const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });

    useEffect(() => {
        fetchPayments();
        fetchStats();
    }, [searchTerm, paymentModeFilter, pagination.page]);

    const fetchPayments = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                page: pagination.page,
                limit: pagination.limit,
                ...(searchTerm && { search: searchTerm }),
                ...(paymentModeFilter && { paymentMode: paymentModeFilter })
            });
            
            const response = await apiRequest(`${API_ENDPOINTS.payments}?${params}`);
            if (response.success) {
                setPayments(response.data.data || []);
                setPagination(prev => ({ ...prev, total: response.data.pagination?.total || 0 }));
            }
        } catch (error) {
            console.error('Error fetching payments:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await apiRequest(`${API_ENDPOINTS.payments}/stats`);
            if (response.success) {
                setStats(response.data.data || stats);
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this payment? This will reverse the payment on associated bills.')) {
            try {
                const response = await apiRequest(`${API_ENDPOINTS.payments}/${id}`, {
                    method: 'DELETE'
                });
                if (response.success) {
                    fetchPayments();
                    fetchStats();
                }
            } catch (error) {
                console.error('Error deleting payment:', error);
            }
        }
    };

    const getPaymentModeIcon = (mode) => {
        const icons = {
            cash: '💵',
            bank_transfer: '🏦',
            cheque: '📝',
            card: '💳',
            upi: '📱',
            other: '💰'
        };
        return icons[mode] || '💰';
    };

    const getPaymentModeBadge = (mode) => {
        const badges = {
            cash: { bg: 'bg-green-100', text: 'text-green-700' },
            bank_transfer: { bg: 'bg-blue-100', text: 'text-blue-700' },
            cheque: { bg: 'bg-purple-100', text: 'text-purple-700' },
            card: { bg: 'bg-pink-100', text: 'text-pink-700' },
            upi: { bg: 'bg-orange-100', text: 'text-orange-700' },
            other: { bg: 'bg-gray-100', text: 'text-gray-700' }
        };
        const badge = badges[mode] || badges.other;
        
        return (
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
                {getPaymentModeIcon(mode)}
                {mode?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
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
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-green-50/30 to-emerald-50/30 p-6">
            {/* Header */}
            <div className="mb-8">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-green-800 to-emerald-800 bg-clip-text text-transparent">
                            Payments Made
                        </h1>
                        <p className="text-gray-500 mt-1">Track all vendor payments</p>
                    </div>
                    <button
                        onClick={() => navigate('/purchases/payments/new')}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-medium shadow-lg shadow-green-500/30 hover:shadow-xl hover:shadow-green-500/40 transition-all duration-200 hover:-translate-y-0.5"
                    >
                        <FiPlus className="w-5 h-5" />
                        Record Payment
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard
                    icon={FiDollarSign}
                    title="Total Payments"
                    value={stats.totalPayments}
                    subtitle={formatCurrency(stats.totalAmount)}
                    gradient="bg-gradient-to-br from-green-500 to-emerald-600"
                />
                <StatCard
                    icon={FiCalendar}
                    title="This Month"
                    value={stats.thisMonthPayments}
                    subtitle={formatCurrency(stats.thisMonthAmount)}
                    gradient="bg-gradient-to-br from-blue-500 to-indigo-600"
                />
                <StatCard
                    icon={FiTrendingUp}
                    title="This Year"
                    value={formatCurrency(stats.thisYearAmount)}
                    gradient="bg-gradient-to-br from-purple-500 to-violet-600"
                />
                <StatCard
                    icon={FiCreditCard}
                    title="Payment Methods"
                    value={stats.paymentModeStats?.length || 0}
                    subtitle="Active methods"
                    gradient="bg-gradient-to-br from-orange-500 to-amber-600"
                />
            </div>

            {/* Filters */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search payments by number, reference or vendor..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all"
                        />
                    </div>
                    <div className="flex gap-3">
                        <select
                            value={paymentModeFilter}
                            onChange={(e) => setPaymentModeFilter(e.target.value)}
                            className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all"
                        >
                            <option value="">All Methods</option>
                            <option value="cash">Cash</option>
                            <option value="bank_transfer">Bank Transfer</option>
                            <option value="cheque">Cheque</option>
                            <option value="card">Card</option>
                            <option value="upi">UPI</option>
                            <option value="other">Other</option>
                        </select>
                        <button
                            onClick={() => { fetchPayments(); fetchStats(); }}
                            className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors"
                        >
                            <FiRefreshCw className="w-5 h-5 text-gray-600" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Payments List */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {loading ? (
                    <div className="p-12 text-center">
                        <div className="animate-spin w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full mx-auto mb-4" />
                        <p className="text-gray-500">Loading payments...</p>
                    </div>
                ) : payments.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FiDollarSign className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No payments found</h3>
                        <p className="text-gray-500 mb-6">Get started by recording your first payment</p>
                        <button
                            onClick={() => navigate('/purchases/payments/new')}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors"
                        >
                            <FiPlus className="w-5 h-5" />
                            Record Payment
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Desktop Table */}
                        <div className="hidden lg:block overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-100">
                                    <tr>
                                        <th className="text-left py-4 px-6 font-semibold text-gray-700">Payment #</th>
                                        <th className="text-left py-4 px-6 font-semibold text-gray-700">Vendor</th>
                                        <th className="text-left py-4 px-6 font-semibold text-gray-700">Date</th>
                                        <th className="text-center py-4 px-6 font-semibold text-gray-700">Mode</th>
                                        <th className="text-left py-4 px-6 font-semibold text-gray-700">Reference</th>
                                        <th className="text-right py-4 px-6 font-semibold text-gray-700">Amount</th>
                                        <th className="text-center py-4 px-6 font-semibold text-gray-700">Bills</th>
                                        <th className="text-center py-4 px-6 font-semibold text-gray-700">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {payments.map((payment) => (
                                        <tr key={payment.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="py-4 px-6">
                                                <span className="font-medium text-green-600">{payment.paymentNumber}</span>
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white font-semibold text-sm">
                                                        {payment.supplier?.companyName?.charAt(0) || 'V'}
                                                    </div>
                                                    <div>
                                                        <div className="font-medium text-gray-900">{payment.supplier?.companyName || 'Unknown'}</div>
                                                        <div className="text-sm text-gray-500">{payment.supplier?.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6 text-gray-600">{formatDate(payment.paymentDate)}</td>
                                            <td className="py-4 px-6 text-center">{getPaymentModeBadge(payment.paymentMode)}</td>
                                            <td className="py-4 px-6 text-gray-600">{payment.referenceNumber || '-'}</td>
                                            <td className="py-4 px-6 text-right font-bold text-green-600 text-lg">
                                                {formatCurrency(payment.amount)}
                                            </td>
                                            <td className="py-4 px-6 text-center">
                                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-lg text-sm">
                                                    <FiFileText className="w-4 h-4" />
                                                    {payment.paymentItems?.length || 0}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button
                                                        onClick={() => navigate(`/purchases/payments/${payment.id}`)}
                                                        className="p-2 hover:bg-green-50 rounded-lg transition-colors text-green-600"
                                                        title="View"
                                                    >
                                                        <FiEye className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(payment.id)}
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
                            {payments.map((payment) => (
                                <div key={payment.id} className="p-4 hover:bg-gray-50 transition-colors">
                                    <div className="flex items-start justify-between mb-3">
                                        <div>
                                            <span className="font-semibold text-green-600">{payment.paymentNumber}</span>
                                            <div className="text-sm text-gray-500 mt-1">{payment.supplier?.companyName}</div>
                                        </div>
                                        {getPaymentModeBadge(payment.paymentMode)}
                                    </div>
                                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                                        <div>
                                            <div className="text-2xl font-bold text-green-600">{formatCurrency(payment.amount)}</div>
                                            <div className="text-sm text-gray-500">{formatDate(payment.paymentDate)}</div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => navigate(`/purchases/payments/${payment.id}`)}
                                                className="p-2 bg-green-50 rounded-lg text-green-600"
                                            >
                                                <FiEye className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(payment.id)}
                                                className="p-2 bg-red-50 rounded-lg text-red-600"
                                            >
                                                <FiTrash2 className="w-4 h-4" />
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
                        Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} payments
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

export default PaymentsPage;
