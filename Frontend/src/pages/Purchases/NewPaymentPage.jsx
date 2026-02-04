import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    FiDollarSign, FiSave, FiX, FiUser, FiCalendar, FiCreditCard,
    FiFileText, FiHash, FiChevronDown, FiCheck, FiAlertCircle
} from 'react-icons/fi';
import { API_ENDPOINTS, apiRequest } from '../../config/api';

// Reusable Components
const FormInput = ({ label, icon: Icon, error, ...props }) => (
    <div className="space-y-1.5">
        {label && <label className="block text-sm font-medium text-gray-700">{label}</label>}
        <div className="relative">
            {Icon && (
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <Icon className="w-5 h-5" />
                </div>
            )}
            <input
                className={`w-full ${Icon ? 'pl-11' : 'pl-4'} pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 focus:bg-white transition-all ${error ? 'border-red-300' : ''}`}
                {...props}
            />
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
);

const FormSelect = ({ label, icon: Icon, options, error, ...props }) => (
    <div className="space-y-1.5">
        {label && <label className="block text-sm font-medium text-gray-700">{label}</label>}
        <div className="relative">
            {Icon && (
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <Icon className="w-5 h-5" />
                </div>
            )}
            <select
                className={`w-full ${Icon ? 'pl-11' : 'pl-4'} pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 focus:bg-white transition-all appearance-none ${error ? 'border-red-300' : ''}`}
                {...props}
            >
                {options.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
            </select>
            <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
);

const SectionCard = ({ title, icon: Icon, children, className = "" }) => (
    <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden ${className}`}>
        <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                    <Icon className="w-5 h-5 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900">{title}</h3>
            </div>
        </div>
        <div className="p-6">{children}</div>
    </div>
);

const NewPaymentPage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [suppliers, setSuppliers] = useState([]);
    const [openBills, setOpenBills] = useState([]);
    const [loadingBills, setLoadingBills] = useState(false);

    const [formData, setFormData] = useState({
        supplierId: '',
        paymentDate: new Date().toISOString().split('T')[0],
        amount: '',
        paymentMode: 'cash',
        referenceNumber: '',
        bankName: '',
        chequeNumber: '',
        chequeDate: '',
        notes: ''
    });

    const [billPayments, setBillPayments] = useState([]);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        fetchSuppliers();
    }, []);

    useEffect(() => {
        if (formData.supplierId) {
            fetchOpenBills(formData.supplierId);
        } else {
            setOpenBills([]);
            setBillPayments([]);
        }
    }, [formData.supplierId]);

    const fetchSuppliers = async () => {
        try {
            const response = await apiRequest(API_ENDPOINTS.suppliers);
            if (response.success) {
                setSuppliers(response.data.data || response.data || []);
            }
        } catch (error) {
            console.error('Error fetching suppliers:', error);
        }
    };

    const fetchOpenBills = async (supplierId) => {
        try {
            setLoadingBills(true);
            const response = await apiRequest(`${API_ENDPOINTS.bills}/supplier/${supplierId}/open`);
            if (response.success) {
                setOpenBills(response.data.data || []);
                // Initialize bill payments with all open bills
                setBillPayments((response.data.data || []).map(bill => ({
                    billId: bill.id,
                    billNumber: bill.billNumber,
                    grandTotal: parseFloat(bill.grandTotal),
                    balanceDue: parseFloat(bill.balanceDue),
                    dueDate: bill.dueDate,
                    amountApplied: 0,
                    selected: false
                })));
            }
        } catch (error) {
            console.error('Error fetching open bills:', error);
        } finally {
            setLoadingBills(false);
        }
    };

    const handleBillToggle = (index) => {
        const updated = [...billPayments];
        updated[index].selected = !updated[index].selected;
        if (!updated[index].selected) {
            updated[index].amountApplied = 0;
        }
        setBillPayments(updated);
    };

    const handleBillAmountChange = (index, value) => {
        const updated = [...billPayments];
        const amount = parseFloat(value) || 0;
        updated[index].amountApplied = Math.min(amount, updated[index].balanceDue);
        updated[index].selected = amount > 0;
        setBillPayments(updated);
    };

    const applyFullAmount = () => {
        const totalAmount = parseFloat(formData.amount) || 0;
        let remainingAmount = totalAmount;
        
        const updated = billPayments.map(bill => {
            if (remainingAmount > 0) {
                const amountToApply = Math.min(remainingAmount, bill.balanceDue);
                remainingAmount -= amountToApply;
                return { ...bill, amountApplied: amountToApply, selected: amountToApply > 0 };
            }
            return { ...bill, amountApplied: 0, selected: false };
        });
        
        setBillPayments(updated);
    };

    const getTotalApplied = () => {
        return billPayments.reduce((sum, bill) => sum + (bill.amountApplied || 0), 0);
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validation
        const newErrors = {};
        if (!formData.supplierId) newErrors.supplierId = 'Please select a vendor';
        if (!formData.paymentDate) newErrors.paymentDate = 'Payment date is required';
        if (!formData.amount || parseFloat(formData.amount) <= 0) newErrors.amount = 'Enter a valid amount';
        if (formData.paymentMode === 'cheque' && !formData.chequeNumber) newErrors.chequeNumber = 'Cheque number is required';
        if (formData.paymentMode === 'bank_transfer' && !formData.referenceNumber) newErrors.referenceNumber = 'Reference number is required';
        
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setLoading(true);
        try {
            const selectedBillPayments = billPayments
                .filter(bp => bp.selected && bp.amountApplied > 0)
                .map(bp => ({
                    billId: bp.billId,
                    amountApplied: bp.amountApplied
                }));

            const response = await apiRequest(API_ENDPOINTS.payments, {
                method: 'POST',
                body: JSON.stringify({
                    ...formData,
                    amount: parseFloat(formData.amount),
                    billPayments: selectedBillPayments
                })
            });

            if (response.success) {
                navigate('/purchases/payments');
            } else {
                setErrors({ submit: response.error || 'Failed to record payment' });
            }
        } catch (error) {
            console.error('Error recording payment:', error);
            setErrors({ submit: 'Failed to record payment' });
        } finally {
            setLoading(false);
        }
    };

    const showBankFields = ['bank_transfer', 'cheque'].includes(formData.paymentMode);
    const showChequeFields = formData.paymentMode === 'cheque';

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-green-50/30 to-emerald-50/30">
            {/* Header */}
            <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg shadow-green-500/30">
                                <FiDollarSign className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Record Payment</h1>
                                <p className="text-sm text-gray-500">Record a payment to vendor</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => navigate('/purchases/payments')}
                                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
                            >
                                <FiX className="w-5 h-5" />
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={loading}
                                className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-medium shadow-lg shadow-green-500/30 hover:shadow-xl hover:shadow-green-500/40 transition-all disabled:opacity-50"
                            >
                                <FiSave className="w-5 h-5" />
                                {loading ? 'Saving...' : 'Record Payment'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-8">
                {errors.submit && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 flex items-center gap-2">
                        <FiAlertCircle className="w-5 h-5" />
                        {errors.submit}
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Form */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Payment Details */}
                        <SectionCard title="Payment Details" icon={FiDollarSign}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormSelect
                                    label="Vendor *"
                                    icon={FiUser}
                                    value={formData.supplierId}
                                    onChange={(e) => setFormData({ ...formData, supplierId: e.target.value })}
                                    error={errors.supplierId}
                                    options={[
                                        { value: '', label: 'Select Vendor' },
                                        ...suppliers.map(s => ({ value: s.id, label: s.companyName }))
                                    ]}
                                />
                                <FormInput
                                    label="Amount *"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    icon={FiDollarSign}
                                    value={formData.amount}
                                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                    error={errors.amount}
                                    placeholder="0.00"
                                />
                                <FormInput
                                    label="Payment Date *"
                                    type="date"
                                    icon={FiCalendar}
                                    value={formData.paymentDate}
                                    onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
                                    error={errors.paymentDate}
                                />
                                <FormSelect
                                    label="Payment Mode *"
                                    icon={FiCreditCard}
                                    value={formData.paymentMode}
                                    onChange={(e) => setFormData({ ...formData, paymentMode: e.target.value })}
                                    options={[
                                        { value: 'cash', label: '💵 Cash' },
                                        { value: 'bank_transfer', label: '🏦 Bank Transfer' },
                                        { value: 'cheque', label: '📝 Cheque' },
                                        { value: 'card', label: '💳 Card' },
                                        { value: 'upi', label: '📱 UPI' },
                                        { value: 'other', label: '💰 Other' }
                                    ]}
                                />
                            </div>

                            {/* Additional Fields based on payment mode */}
                            {(showBankFields || formData.paymentMode !== 'cash') && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 pt-6 border-t border-gray-100">
                                    <FormInput
                                        label={showChequeFields ? "Reference Number" : "Reference Number *"}
                                        icon={FiHash}
                                        value={formData.referenceNumber}
                                        onChange={(e) => setFormData({ ...formData, referenceNumber: e.target.value })}
                                        error={errors.referenceNumber}
                                        placeholder="Transaction/Reference ID"
                                    />
                                    {showBankFields && (
                                        <FormInput
                                            label="Bank Name"
                                            value={formData.bankName}
                                            onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                                            placeholder="Enter bank name"
                                        />
                                    )}
                                    {showChequeFields && (
                                        <>
                                            <FormInput
                                                label="Cheque Number *"
                                                icon={FiFileText}
                                                value={formData.chequeNumber}
                                                onChange={(e) => setFormData({ ...formData, chequeNumber: e.target.value })}
                                                error={errors.chequeNumber}
                                                placeholder="Enter cheque number"
                                            />
                                            <FormInput
                                                label="Cheque Date"
                                                type="date"
                                                icon={FiCalendar}
                                                value={formData.chequeDate}
                                                onChange={(e) => setFormData({ ...formData, chequeDate: e.target.value })}
                                            />
                                        </>
                                    )}
                                </div>
                            )}
                        </SectionCard>

                        {/* Apply to Bills */}
                        <SectionCard title="Apply to Bills" icon={FiFileText}>
                            {!formData.supplierId ? (
                                <div className="text-center py-8 text-gray-500">
                                    <FiUser className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                    <p>Select a vendor to see open bills</p>
                                </div>
                            ) : loadingBills ? (
                                <div className="text-center py-8">
                                    <div className="animate-spin w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full mx-auto mb-4" />
                                    <p className="text-gray-500">Loading open bills...</p>
                                </div>
                            ) : openBills.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    <FiCheck className="w-12 h-12 mx-auto mb-3 text-green-400" />
                                    <p>No open bills for this vendor</p>
                                    <p className="text-sm mt-1">All bills are paid!</p>
                                </div>
                            ) : (
                                <>
                                    <div className="flex items-center justify-between mb-4">
                                        <p className="text-sm text-gray-600">{openBills.length} open bill(s)</p>
                                        <button
                                            type="button"
                                            onClick={applyFullAmount}
                                            disabled={!formData.amount}
                                            className="text-sm text-green-600 hover:text-green-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Auto-apply amount
                                        </button>
                                    </div>
                                    <div className="space-y-3">
                                        {billPayments.map((bill, index) => (
                                            <div 
                                                key={bill.billId} 
                                                className={`p-4 rounded-xl border-2 transition-all ${
                                                    bill.selected 
                                                        ? 'border-green-300 bg-green-50/50' 
                                                        : 'border-gray-100 hover:border-gray-200'
                                                }`}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleBillToggle(index)}
                                                        className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                                                            bill.selected 
                                                                ? 'bg-green-500 border-green-500 text-white' 
                                                                : 'border-gray-300 hover:border-green-400'
                                                        }`}
                                                    >
                                                        {bill.selected && <FiCheck className="w-4 h-4" />}
                                                    </button>
                                                    <div className="flex-1">
                                                        <div className="flex items-center justify-between">
                                                            <span className="font-semibold text-gray-900">{bill.billNumber}</span>
                                                            <span className="text-sm text-gray-500">Due: {formatDate(bill.dueDate)}</span>
                                                        </div>
                                                        <div className="flex items-center justify-between mt-1">
                                                            <span className="text-sm text-gray-500">Total: {formatCurrency(bill.grandTotal)}</span>
                                                            <span className="text-sm font-medium text-red-600">Balance: {formatCurrency(bill.balanceDue)}</span>
                                                        </div>
                                                    </div>
                                                    <div className="w-32">
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            max={bill.balanceDue}
                                                            step="0.01"
                                                            value={bill.amountApplied || ''}
                                                            onChange={(e) => handleBillAmountChange(index, e.target.value)}
                                                            placeholder="0.00"
                                                            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-right focus:ring-2 focus:ring-green-500/20 focus:border-green-500"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}
                        </SectionCard>

                        {/* Notes */}
                        <SectionCard title="Notes" icon={FiFileText}>
                            <textarea
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                rows="3"
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500/20 focus:border-green-500 focus:bg-white transition-all"
                                placeholder="Add any notes about this payment..."
                            />
                        </SectionCard>
                    </div>

                    {/* Summary Sidebar */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-32">
                            <h3 className="font-semibold text-gray-900 mb-4">Payment Summary</h3>
                            
                            <div className="space-y-3">
                                <div className="flex justify-between text-gray-600">
                                    <span>Payment Amount</span>
                                    <span className="font-semibold">{formatCurrency(formData.amount || 0)}</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Applied to Bills</span>
                                    <span className="font-semibold text-green-600">{formatCurrency(getTotalApplied())}</span>
                                </div>
                                <div className="border-t border-gray-200 my-3" />
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Unapplied Amount</span>
                                    <span className={`font-semibold ${(parseFloat(formData.amount || 0) - getTotalApplied()) > 0 ? 'text-amber-600' : 'text-gray-600'}`}>
                                        {formatCurrency((parseFloat(formData.amount || 0) - getTotalApplied()))}
                                    </span>
                                </div>
                            </div>

                            {(parseFloat(formData.amount || 0) - getTotalApplied()) > 0 && openBills.length > 0 && (
                                <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                                    <div className="flex items-start gap-2">
                                        <FiAlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                                        <div className="text-sm text-amber-700">
                                            <p className="font-medium">Unapplied amount</p>
                                            <p>Some payment amount is not applied to bills. It will be recorded as advance payment.</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="mt-6 p-4 bg-green-50 rounded-xl">
                                <div className="flex items-center gap-2 text-green-700">
                                    <FiDollarSign className="w-5 h-5" />
                                    <span className="font-medium">Total Payment</span>
                                </div>
                                <div className="text-2xl font-bold text-green-700 mt-1">
                                    {formatCurrency(formData.amount || 0)}
                                </div>
                            </div>

                            <button
                                onClick={handleSubmit}
                                disabled={loading}
                                className="w-full mt-6 inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-medium shadow-lg shadow-green-500/30 hover:shadow-xl hover:shadow-green-500/40 transition-all disabled:opacity-50"
                            >
                                <FiSave className="w-5 h-5" />
                                {loading ? 'Recording...' : 'Record Payment'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NewPaymentPage;
