import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
    FiFileText, FiArrowLeft, FiEdit2, FiTrash2, FiPrinter,
    FiCalendar, FiUser, FiPackage, FiClock, FiCheckCircle, FiAlertTriangle
} from 'react-icons/fi';
import { FaRupeeSign } from 'react-icons/fa';
import { API_ENDPOINTS, apiRequest } from '../../config/api';

const ViewBillPage = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [bill, setBill] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchBill();
    }, [id]);

    const fetchBill = async () => {
        try {
            setLoading(true);
            const response = await apiRequest(`${API_ENDPOINTS.bills}/${id}`);
            if (response.success && response.data) {
                setBill(response.data.data || response.data);
            }
        } catch (error) {
            console.error('Error fetching bill:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete this bill?')) {
            try {
                const response = await apiRequest(`${API_ENDPOINTS.bills}/${id}`, {
                    method: 'DELETE'
                });
                if (response.success) {
                    navigate('/purchases/bills');
                }
            } catch (error) {
                console.error('Error deleting bill:', error);
            }
        }
    };

    const formatCurrency = (amount) => {
        const num = parseFloat(amount);
        if (isNaN(num)) return 'Rs. 0.00';
        return `Rs. ${num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    const formatDate = (date) => {
        if (!date) return '-';
        return new Date(date).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    const getStatusBadge = (status) => {
        const badges = {
            draft: { bg: 'bg-gray-100', text: 'text-gray-700', icon: FiFileText, label: 'Draft' },
            open: { bg: 'bg-blue-100', text: 'text-blue-700', icon: FiClock, label: 'Open' },
            partially_paid: { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: FaRupeeSign, label: 'Partially Paid' },
            paid: { bg: 'bg-green-100', text: 'text-green-700', icon: FiCheckCircle, label: 'Paid' },
            overdue: { bg: 'bg-red-100', text: 'text-red-700', icon: FiAlertTriangle, label: 'Overdue' },
            cancelled: { bg: 'bg-gray-100', text: 'text-gray-500', icon: FiFileText, label: 'Cancelled' }
        };
        const badge = badges[status] || badges.draft;
        const Icon = badge.icon;
        
        return (
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${badge.bg} ${badge.text}`}>
                <Icon className="w-4 h-4" />
                {badge.label}
            </span>
        );
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!bill) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <FiFileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-gray-700">Bill not found</h2>
                    <button
                        onClick={() => navigate('/purchases/bills')}
                        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        Back to Bills
                    </button>
                </div>
            </div>
        );
    }

    const supplierName = bill.supplier?.displayName || bill.supplier?.companyName || 
        `${bill.supplier?.firstName || ''} ${bill.supplier?.lastName || ''}`.trim() || 'Unknown Vendor';

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
            <div className="max-w-5xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/purchases/bills')}
                            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                        >
                            <FiArrowLeft className="w-6 h-6 text-gray-600" />
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">{bill.billNumber}</h1>
                            <p className="text-gray-500">{supplierName}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        {getStatusBadge(bill.status)}
                        <button
                            onClick={() => navigate(`/purchases/bills/${id}/edit`)}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                        >
                            <FiEdit2 className="w-4 h-4" />
                            Edit
                        </button>
                        <button
                            onClick={handleDelete}
                            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors"
                        >
                            <FiTrash2 className="w-4 h-4" />
                            Delete
                        </button>
                    </div>
                </div>

                {/* Bill Details */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div>
                                <p className="text-sm text-gray-500 mb-1">Bill Date</p>
                                <p className="font-semibold text-gray-900">{formatDate(bill.billDate)}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 mb-1">Due Date</p>
                                <p className="font-semibold text-gray-900">{formatDate(bill.dueDate)}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 mb-1">Vendor Email</p>
                                <p className="font-semibold text-gray-900">{bill.supplier?.email || '-'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 mb-1">Vendor Phone</p>
                                <p className="font-semibold text-gray-900">{bill.supplier?.phone || '-'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Items Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="text-left py-3 px-6 text-sm font-semibold text-gray-600">Item</th>
                                    <th className="text-right py-3 px-6 text-sm font-semibold text-gray-600">Qty</th>
                                    <th className="text-right py-3 px-6 text-sm font-semibold text-gray-600">Rate</th>
                                    <th className="text-right py-3 px-6 text-sm font-semibold text-gray-600">Discount</th>
                                    <th className="text-right py-3 px-6 text-sm font-semibold text-gray-600">Tax</th>
                                    <th className="text-right py-3 px-6 text-sm font-semibold text-gray-600">Total</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {bill.items && bill.items.length > 0 ? (
                                    bill.items.map((item, index) => (
                                        <tr key={index} className="hover:bg-gray-50">
                                            <td className="py-4 px-6">
                                                <div className="font-medium text-gray-900">{item.item?.name || 'Unknown Item'}</div>
                                                <div className="text-sm text-gray-500">{item.item?.sku || ''}</div>
                                            </td>
                                            <td className="py-4 px-6 text-right text-gray-600">{item.quantity}</td>
                                            <td className="py-4 px-6 text-right text-gray-600">{formatCurrency(item.unitPrice)}</td>
                                            <td className="py-4 px-6 text-right text-gray-600">
                                                {item.discountType === 'percentage' 
                                                    ? `${item.discount}%` 
                                                    : formatCurrency(item.discount)}
                                            </td>
                                            <td className="py-4 px-6 text-right text-gray-600">{item.tax}%</td>
                                            <td className="py-4 px-6 text-right font-semibold text-gray-900">{formatCurrency(item.total)}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="py-8 text-center text-gray-500">
                                            No items in this bill
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Totals */}
                    <div className="p-6 bg-gray-50 border-t border-gray-100">
                        <div className="max-w-xs ml-auto space-y-2">
                            <div className="flex justify-between text-gray-600">
                                <span>Subtotal</span>
                                <span>{formatCurrency(bill.subtotal)}</span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                                <span>Discount</span>
                                <span>-{formatCurrency(bill.totalDiscount)}</span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                                <span>Tax</span>
                                <span>{formatCurrency(bill.totalTax)}</span>
                            </div>
                            <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t border-gray-200">
                                <span>Total</span>
                                <span>{formatCurrency(bill.grandTotal)}</span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                                <span>Amount Paid</span>
                                <span className="text-green-600">{formatCurrency(bill.amountPaid)}</span>
                            </div>
                            <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200">
                                <span>Balance Due</span>
                                <span className={parseFloat(bill.balanceDue) > 0 ? 'text-red-600' : 'text-green-600'}>
                                    {formatCurrency(bill.balanceDue)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Notes */}
                    {bill.notes && (
                        <div className="p-6 border-t border-gray-100">
                            <h3 className="text-sm font-semibold text-gray-700 mb-2">Notes</h3>
                            <p className="text-gray-600">{bill.notes}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ViewBillPage;
