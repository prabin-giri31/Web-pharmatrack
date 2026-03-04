import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
    FiFileText, FiSave, FiX, FiPlus, FiTrash2, FiSearch,
    FiCalendar, FiUser, FiPackage, FiPercent, FiChevronDown
} from 'react-icons/fi';
import { FaRupeeSign } from 'react-icons/fa';
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
                className={`w-full ${Icon ? 'pl-11' : 'pl-4'} pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all ${error ? 'border-red-300' : ''}`}
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
                className={`w-full ${Icon ? 'pl-11' : 'pl-4'} pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all appearance-none ${error ? 'border-red-300' : ''}`}
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
                <div className="p-2 bg-blue-100 rounded-lg">
                    <Icon className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900">{title}</h3>
            </div>
        </div>
        <div className="p-6">{children}</div>
    </div>
);

const EditBillPage = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [suppliers, setSuppliers] = useState([]);
    const [items, setItems] = useState([]);
    const [showItemSearch, setShowItemSearch] = useState(false);
    const [itemSearchTerm, setItemSearchTerm] = useState('');

    const [formData, setFormData] = useState({
        supplierId: '',
        billDate: '',
        dueDate: '',
        status: 'draft',
        notes: '',
        terms: ''
    });

    const [billItems, setBillItems] = useState([]);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        fetchSuppliers();
        fetchItems();
        fetchBill();
    }, [id]);

    const fetchBill = async () => {
        try {
            const response = await apiRequest(`${API_ENDPOINTS.bills}/${id}`);
            if (response.success && response.data) {
                const bill = response.data.data || response.data;
                setFormData({
                    supplierId: bill.supplierId?.toString() || '',
                    billDate: bill.billDate || '',
                    dueDate: bill.dueDate || '',
                    status: bill.status || 'draft',
                    notes: bill.notes || '',
                    terms: bill.terms || ''
                });
                if (bill.items && bill.items.length > 0) {
                    setBillItems(bill.items.map(item => ({
                        itemId: item.itemId,
                        itemName: item.item?.name || 'Unknown',
                        sku: item.item?.sku || '',
                        description: item.description || item.item?.name || '',
                        quantity: item.quantity || 1,
                        unitPrice: parseFloat(item.unitPrice) || 0,
                        discount: parseFloat(item.discount) || 0,
                        discountType: item.discountType === 'fixed' ? 'amount' : 'percentage',
                        tax: parseFloat(item.tax) || 0
                    })));
                }
            }
        } catch (error) {
            console.error('Error fetching bill:', error);
        } finally {
            setInitialLoading(false);
        }
    };

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

    const fetchItems = async () => {
        try {
            const response = await apiRequest(API_ENDPOINTS.items);
            if (response.success) {
                setItems(response.data.data || response.data || []);
            }
        } catch (error) {
            console.error('Error fetching items:', error);
        }
    };

    const handleAddItem = (item) => {
        const exists = billItems.find(i => i.itemId === item.id);
        if (!exists) {
            setBillItems([...billItems, {
                itemId: item.id,
                itemName: item.name,
                sku: item.sku,
                description: item.name,
                quantity: 1,
                unitPrice: item.costPrice || 0,
                discount: 0,
                discountType: 'amount',
                tax: 0
            }]);
        }
        setShowItemSearch(false);
        setItemSearchTerm('');
    };

    const handleRemoveItem = (index) => {
        setBillItems(billItems.filter((_, i) => i !== index));
    };

    const handleItemChange = (index, field, value) => {
        const updated = [...billItems];
        updated[index][field] = value;
        setBillItems(updated);
    };

    const calculateItemTotal = (item) => {
        const subtotal = item.quantity * item.unitPrice;
        const discountAmount = item.discountType === 'percentage' 
            ? (subtotal * item.discount / 100) 
            : item.discount;
        const afterDiscount = subtotal - discountAmount;
        const taxAmount = afterDiscount * (item.tax / 100);
        return afterDiscount + taxAmount;
    };

    const calculateTotals = () => {
        let subtotal = 0;
        let totalDiscount = 0;
        let totalTax = 0;

        billItems.forEach(item => {
            const itemSubtotal = item.quantity * item.unitPrice;
            const discountAmount = item.discountType === 'percentage' 
                ? (itemSubtotal * item.discount / 100) 
                : item.discount;
            const afterDiscount = itemSubtotal - discountAmount;
            const taxAmount = afterDiscount * (item.tax / 100);

            subtotal += itemSubtotal;
            totalDiscount += discountAmount;
            totalTax += taxAmount;
        });

        return {
            subtotal,
            totalDiscount,
            totalTax,
            grandTotal: subtotal - totalDiscount + totalTax
        };
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validation
        const newErrors = {};
        if (!formData.supplierId) newErrors.supplierId = 'Please select a vendor';
        if (!formData.billDate) newErrors.billDate = 'Bill date is required';
        if (!formData.dueDate) newErrors.dueDate = 'Due date is required';
        if (billItems.length === 0) newErrors.items = 'Add at least one item';
        
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setLoading(true);
        try {
            const response = await apiRequest(`${API_ENDPOINTS.bills}/${id}`, {
                method: 'PUT',
                body: JSON.stringify({
                    ...formData,
                    supplierId: parseInt(formData.supplierId),
                    items: billItems.map(item => ({
                        itemId: item.itemId,
                        quantity: parseInt(item.quantity) || 1,
                        rate: parseFloat(item.unitPrice) || 0,
                        discount: parseFloat(item.discount) || 0,
                        discountType: item.discountType === 'amount' ? 'fixed' : 'percentage',
                        tax: parseFloat(item.tax) || 0
                    }))
                })
            });

            if (response.success) {
                navigate('/purchases/bills');
            } else {
                setErrors({ submit: response.error || 'Failed to update bill' });
            }
        } catch (error) {
            console.error('Error updating bill:', error);
            setErrors({ submit: 'Failed to update bill' });
        } finally {
            setLoading(false);
        }
    };

    const totals = calculateTotals();
    const filteredItems = items.filter(item => 
        item.name?.toLowerCase().includes(itemSearchTerm.toLowerCase()) ||
        item.sku?.toLowerCase().includes(itemSearchTerm.toLowerCase())
    );

    const formatCurrency = (amount) => {
        return `Rs. ${parseFloat(amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    if (initialLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/30">
            {/* Header */}
            <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg shadow-blue-500/30">
                                <FiFileText className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Edit Bill</h1>
                                <p className="text-sm text-gray-500">Update bill details</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => navigate('/purchases/bills')}
                                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
                            >
                                <FiX className="w-5 h-5" />
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={loading}
                                className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:shadow-lg hover:shadow-blue-500/30 transition-all disabled:opacity-50"
                            >
                                <FiSave className="w-5 h-5" />
                                {loading ? 'Saving...' : 'Update Bill'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Form */}
            <div className="max-w-7xl mx-auto px-6 py-8">
                {errors.submit && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
                        {errors.submit}
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Form */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Vendor & Dates */}
                        <SectionCard title="Bill Information" icon={FiFileText}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <FormSelect
                                    label="Vendor"
                                    icon={FiUser}
                                    value={formData.supplierId}
                                    onChange={(e) => setFormData({ ...formData, supplierId: e.target.value })}
                                    options={[
                                        { value: '', label: 'Select Vendor' },
                                        ...suppliers.map(s => ({ 
                                            value: s.id.toString(), 
                                            label: s.displayName || s.companyName || s.name || `${s.firstName} ${s.lastName}` 
                                        }))
                                    ]}
                                    error={errors.supplierId}
                                />
                                <FormSelect
                                    label="Status"
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                    options={[
                                        { value: 'draft', label: 'Draft' },
                                        { value: 'open', label: 'Open' },
                                        { value: 'partially_paid', label: 'Partially Paid' },
                                        { value: 'paid', label: 'Paid' },
                                        { value: 'overdue', label: 'Overdue' },
                                        { value: 'cancelled', label: 'Cancelled' }
                                    ]}
                                />
                                <FormInput
                                    label="Bill Date"
                                    type="date"
                                    icon={FiCalendar}
                                    value={formData.billDate}
                                    onChange={(e) => setFormData({ ...formData, billDate: e.target.value })}
                                    error={errors.billDate}
                                />
                                <FormInput
                                    label="Due Date"
                                    type="date"
                                    icon={FiCalendar}
                                    value={formData.dueDate}
                                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                                    error={errors.dueDate}
                                />
                            </div>
                        </SectionCard>

                        {/* Items */}
                        <SectionCard title="Bill Items" icon={FiPackage}>
                            {errors.items && (
                                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                                    {errors.items}
                                </div>
                            )}
                            
                            {/* Item Search */}
                            <div className="relative mb-4">
                                <div className="relative">
                                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                    <input
                                        type="text"
                                        placeholder="Search items to add..."
                                        value={itemSearchTerm}
                                        onChange={(e) => {
                                            setItemSearchTerm(e.target.value);
                                            setShowItemSearch(true);
                                        }}
                                        onFocus={() => setShowItemSearch(true)}
                                        className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                    />
                                </div>
                                
                                {showItemSearch && itemSearchTerm && (
                                    <div className="absolute z-10 w-full mt-2 bg-white rounded-xl shadow-lg border border-gray-200 max-h-60 overflow-auto">
                                        {filteredItems.length > 0 ? (
                                            filteredItems.slice(0, 10).map(item => (
                                                <button
                                                    key={item.id}
                                                    type="button"
                                                    onClick={() => handleAddItem(item)}
                                                    className="w-full px-4 py-3 text-left hover:bg-blue-50 flex items-center justify-between border-b border-gray-100 last:border-0"
                                                >
                                                    <div>
                                                        <div className="font-medium text-gray-900">{item.name}</div>
                                                        <div className="text-sm text-gray-500">SKU: {item.sku}</div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="font-semibold text-blue-600">{formatCurrency(item.costPrice)}</div>
                                                        <div className="text-xs text-gray-500">Stock: {item.stock || 0}</div>
                                                    </div>
                                                </button>
                                            ))
                                        ) : (
                                            <div className="px-4 py-3 text-gray-500 text-center">No items found</div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Items Table */}
                            {billItems.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Item</th>
                                                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-600 w-24">Qty</th>
                                                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-600 w-32">Rate</th>
                                                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-600 w-32">Discount</th>
                                                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-600 w-24">Tax %</th>
                                                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600">Total</th>
                                                <th className="w-12"></th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {billItems.map((item, index) => (
                                                <tr key={index} className="hover:bg-gray-50">
                                                    <td className="py-3 px-4">
                                                        <div className="font-medium text-gray-900">{item.itemName}</div>
                                                        <div className="text-sm text-gray-500">{item.sku}</div>
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <input
                                                            type="number"
                                                            min="1"
                                                            value={item.quantity}
                                                            onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 1)}
                                                            className="w-full text-center py-2 px-2 border border-gray-200 rounded-lg"
                                                        />
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            step="0.01"
                                                            value={item.unitPrice}
                                                            onChange={(e) => handleItemChange(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                                                            className="w-full text-center py-2 px-2 border border-gray-200 rounded-lg"
                                                        />
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <div className="flex gap-1">
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                step="0.01"
                                                                value={item.discount}
                                                                onChange={(e) => handleItemChange(index, 'discount', parseFloat(e.target.value) || 0)}
                                                                className="w-20 text-center py-2 px-2 border border-gray-200 rounded-lg"
                                                            />
                                                            <select
                                                                value={item.discountType}
                                                                onChange={(e) => handleItemChange(index, 'discountType', e.target.value)}
                                                                className="py-2 px-2 border border-gray-200 rounded-lg text-sm"
                                                            >
                                                                <option value="amount">Rs.</option>
                                                                <option value="percentage">%</option>
                                                            </select>
                                                        </div>
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            max="100"
                                                            step="0.01"
                                                            value={item.tax}
                                                            onChange={(e) => handleItemChange(index, 'tax', parseFloat(e.target.value) || 0)}
                                                            className="w-full text-center py-2 px-2 border border-gray-200 rounded-lg"
                                                        />
                                                    </td>
                                                    <td className="py-3 px-4 text-right font-semibold text-gray-900">
                                                        {formatCurrency(calculateItemTotal(item))}
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveItem(index)}
                                                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                                                        >
                                                            <FiTrash2 className="w-4 h-4" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="text-center py-12 text-gray-500">
                                    <FiPackage className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                    <p>No items added yet</p>
                                    <p className="text-sm">Search and add items above</p>
                                </div>
                            )}
                        </SectionCard>

                        {/* Notes */}
                        <SectionCard title="Additional Information" icon={FiFileText}>
                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="block text-sm font-medium text-gray-700">Notes</label>
                                    <textarea
                                        value={formData.notes}
                                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                        rows={3}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all"
                                        placeholder="Add any notes..."
                                    />
                                </div>
                            </div>
                        </SectionCard>
                    </div>

                    {/* Summary Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-24">
                            <SectionCard title="Bill Summary" icon={FaRupeeSign}>
                                <div className="space-y-4">
                                    <div className="flex justify-between text-gray-600">
                                        <span>Subtotal</span>
                                        <span>{formatCurrency(totals.subtotal)}</span>
                                    </div>
                                    <div className="flex justify-between text-gray-600">
                                        <span>Discount</span>
                                        <span className="text-red-500">-{formatCurrency(totals.totalDiscount)}</span>
                                    </div>
                                    <div className="flex justify-between text-gray-600">
                                        <span>Tax</span>
                                        <span>{formatCurrency(totals.totalTax)}</span>
                                    </div>
                                    <div className="pt-4 border-t border-gray-200">
                                        <div className="flex justify-between text-lg font-bold text-gray-900">
                                            <span>Total</span>
                                            <span>{formatCurrency(totals.grandTotal)}</span>
                                        </div>
                                    </div>
                                </div>
                            </SectionCard>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditBillPage;
