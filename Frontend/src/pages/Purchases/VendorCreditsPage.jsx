import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    FiCreditCard, FiPlus, FiSearch, FiRefreshCw, FiDollarSign,
    FiCheck, FiClock, FiAlertCircle, FiMoreVertical, FiEye, 
    FiEdit2, FiTrash2, FiArrowRight, FiPackage, FiPercent
} from 'react-icons/fi';
import { API_ENDPOINTS, apiRequest } from '../../config/api';

const VendorCreditsPage = () => {
    const navigate = useNavigate();
    const [credits, setCredits] = useState([]);
    const [stats, setStats] = useState({
        totalCredits: 0,
        openCredits: 0,
        appliedCredits: 0,
        totalAmount: 0,
        balanceAmount: 0
    });
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });

    useEffect(() => {
        fetchCredits();
        fetchStats();
    }, [searchTerm, statusFilter, pagination.page]);

    const fetchCredits = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                page: pagination.page,
                limit: pagination.limit,
                ...(searchTerm && { search: searchTerm }),
                ...(statusFilter && { status: statusFilter })
            });
            
            const response = await apiRequest(`${API_ENDPOINTS.vendorCredits}?${params}`);
            if (response.success) {
                setCredits(response.data.data || []);
                setPagination(prev => ({ ...prev, total: response.data.pagination?.total || 0 }));
            }
        } catch (error) {
            console.error('Error fetching vendor credits:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await apiRequest(`${API_ENDPOINTS.vendorCredits}/stats`);
            if (response.success) {
                setStats(response.data.data || stats);
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this vendor credit?')) {
            try {
                const response = await apiRequest(`${API_ENDPOINTS.vendorCredits}/${id}`, {
                    method: 'DELETE'
                });
                if (response.success) {
                    fetchCredits();
                    fetchStats();
                }
            } catch (error) {
                console.error('Error deleting credit:', error);
            }
        }
    };

    const getStatusBadge = (status) => {
        const badges = {
            draft: { bg: 'bg-gray-100', text: 'text-gray-700', icon: FiClock },
            open: { bg: 'bg-purple-100', text: 'text-purple-700', icon: FiCreditCard },
            applied: { bg: 'bg-green-100', text: 'text-green-700', icon: FiCheck },
            closed: { bg: 'bg-blue-100', text: 'text-blue-700', icon: FiCheck },
            cancelled: { bg: 'bg-red-100', text: 'text-red-700', icon: FiAlertCircle }
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

    const getReasonBadge = (reason) => {
        const badges = {
            return: { bg: 'bg-blue-50', text: 'text-blue-700', label: '↩️ Return' },
            discount: { bg: 'bg-green-50', text: 'text-green-700', label: '💰 Discount' },
            damaged: { bg: 'bg-red-50', text: 'text-red-700', label: '⚠️ Damaged' },
            price_adjustment: { bg: 'bg-amber-50', text: 'text-amber-700', label: '📊 Price Adjustment' },
            other: { bg: 'bg-gray-50', text: 'text-gray-700', label: '📋 Other' }
        };
        const badge = badges[reason] || badges.other;
        
        return (
            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${badge.bg} ${badge.text}`}>
                {badge.label}
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
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50/30 to-violet-50/30 p-6">
            {/* Header */}
            <div className="mb-8">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-purple-800 to-violet-800 bg-clip-text text-transparent">
                            Vendor Credits
                        </h1>
                        <p className="text-gray-500 mt-1">Manage credits from vendors</p>
                    </div>
                    <button
                        onClick={() => navigate('/purchases/vendor-credits/new')}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-violet-600 text-white rounded-xl font-medium shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 transition-all duration-200 hover:-translate-y-0.5"
                    >
                        <FiPlus className="w-5 h-5" />
                        New Vendor Credit
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard
                    icon={FiCreditCard}
                    title="Total Credits"
                    value={stats.totalCredits}
                    subtitle={formatCurrency(stats.totalAmount)}
                    gradient="bg-gradient-to-br from-purple-500 to-violet-600"
                />
                <StatCard
                    icon={FiClock}
                    title="Open Credits"
                    value={stats.openCredits}
                    subtitle="Available to apply"
                    gradient="bg-gradient-to-br from-blue-500 to-indigo-600"
                />
                <StatCard
                    icon={FiCheck}
                    title="Applied Credits"
                    value={stats.appliedCredits}
                    gradient="bg-gradient-to-br from-green-500 to-emerald-600"
                />
                <StatCard
                    icon={FiDollarSign}
                    title="Balance Available"
                    value={formatCurrency(stats.balanceAmount)}
                    gradient="bg-gradient-to-br from-amber-500 to-orange-600"
                />
            </div>

            {/* Filters */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search credits by number or vendor..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                        />
                    </div>
                    <div className="flex gap-3">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                        >
                            <option value="">All Status</option>
                            <option value="draft">Draft</option>
                            <option value="open">Open</option>
                            <option value="applied">Applied</option>
                            <option value="closed">Closed</option>
                        </select>
                        <button
                            onClick={() => { fetchCredits(); fetchStats(); }}
                            className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors"
                        >
                            <FiRefreshCw className="w-5 h-5 text-gray-600" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Credits List */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {loading ? (
                    <div className="p-12 text-center">
                        <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4" />
                        <p className="text-gray-500">Loading vendor credits...</p>
                    </div>
                ) : credits.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FiCreditCard className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No vendor credits found</h3>
                        <p className="text-gray-500 mb-6">Get started by creating your first vendor credit</p>
                        <button
                            onClick={() => navigate('/purchases/vendor-credits/new')}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition-colors"
                        >
                            <FiPlus className="w-5 h-5" />
                            Create Vendor Credit
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Desktop Table */}
                        <div className="hidden lg:block overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-100">
                                    <tr>
                                        <th className="text-left py-4 px-6 font-semibold text-gray-700">Credit #</th>
                                        <th className="text-left py-4 px-6 font-semibold text-gray-700">Vendor</th>
                                        <th className="text-left py-4 px-6 font-semibold text-gray-700">Date</th>
                                        <th className="text-center py-4 px-6 font-semibold text-gray-700">Reason</th>
                                        <th className="text-right py-4 px-6 font-semibold text-gray-700">Amount</th>
                                        <th className="text-right py-4 px-6 font-semibold text-gray-700">Balance</th>
                                        <th className="text-center py-4 px-6 font-semibold text-gray-700">Status</th>
                                        <th className="text-center py-4 px-6 font-semibold text-gray-700">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {credits.map((credit) => (
                                        <tr key={credit.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="py-4 px-6">
                                                <span className="font-medium text-purple-600">{credit.creditNumber}</span>
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center text-white font-semibold text-sm">
                                                        {credit.supplier?.companyName?.charAt(0) || 'V'}
                                                    </div>
                                                    <div>
                                                        <div className="font-medium text-gray-900">{credit.supplier?.companyName || 'Unknown'}</div>
                                                        <div className="text-sm text-gray-500">{credit.supplier?.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6 text-gray-600">{formatDate(credit.creditDate)}</td>
                                            <td className="py-4 px-6 text-center">{getReasonBadge(credit.reason)}</td>
                                            <td className="py-4 px-6 text-right font-semibold text-gray-900">{formatCurrency(credit.totalAmount)}</td>
                                            <td className="py-4 px-6 text-right">
                                                <span className={`font-semibold ${credit.balanceAmount > 0 ? 'text-purple-600' : 'text-gray-400'}`}>
                                                    {formatCurrency(credit.balanceAmount)}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6 text-center">{getStatusBadge(credit.status)}</td>
                                            <td className="py-4 px-6">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button
                                                        onClick={() => navigate(`/purchases/vendor-credits/${credit.id}`)}
                                                        className="p-2 hover:bg-purple-50 rounded-lg transition-colors text-purple-600"
                                                        title="View"
                                                    >
                                                        <FiEye className="w-4 h-4" />
                                                    </button>
                                                    {credit.status !== 'applied' && (
                                                        <>
                                                            <button
                                                                onClick={() => navigate(`/purchases/vendor-credits/${credit.id}/edit`)}
                                                                className="p-2 hover:bg-blue-50 rounded-lg transition-colors text-blue-600"
                                                                title="Edit"
                                                            >
                                                                <FiEdit2 className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(credit.id)}
                                                                className="p-2 hover:bg-red-50 rounded-lg transition-colors text-red-600"
                                                                title="Delete"
                                                            >
                                                                <FiTrash2 className="w-4 h-4" />
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Cards */}
                        <div className="lg:hidden divide-y divide-gray-100">
                            {credits.map((credit) => (
                                <div key={credit.id} className="p-4 hover:bg-gray-50 transition-colors">
                                    <div className="flex items-start justify-between mb-3">
                                        <div>
                                            <span className="font-semibold text-purple-600">{credit.creditNumber}</span>
                                            <div className="text-sm text-gray-500 mt-1">{credit.supplier?.companyName}</div>
                                        </div>
                                        {getStatusBadge(credit.status)}
                                    </div>
                                    <div className="flex items-center gap-2 mb-3">
                                        {getReasonBadge(credit.reason)}
                                        <span className="text-sm text-gray-500">{formatDate(credit.creditDate)}</span>
                                    </div>
                                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                                        <div>
                                            <div className="text-lg font-bold text-gray-900">{formatCurrency(credit.totalAmount)}</div>
                                            <div className={`text-sm ${credit.balanceAmount > 0 ? 'text-purple-600' : 'text-gray-400'}`}>
                                                Balance: {formatCurrency(credit.balanceAmount)}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => navigate(`/purchases/vendor-credits/${credit.id}`)}
                                                className="p-2 bg-purple-50 rounded-lg text-purple-600"
                                            >
                                                <FiEye className="w-4 h-4" />
                                            </button>
                                            {credit.status !== 'applied' && (
                                                <button
                                                    onClick={() => navigate(`/purchases/vendor-credits/${credit.id}/edit`)}
                                                    className="p-2 bg-blue-50 rounded-lg text-blue-600"
                                                >
                                                    <FiEdit2 className="w-4 h-4" />
                                                </button>
                                            )}
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
                        Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} credits
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

export default VendorCreditsPage;
