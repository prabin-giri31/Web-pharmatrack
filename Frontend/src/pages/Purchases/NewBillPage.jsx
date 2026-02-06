import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    FiFileText, FiSave, FiX, FiPlus, FiTrash2, FiSearch,
    FiCalendar, FiUser, FiPackage, FiDollarSign, FiPercent, FiChevronDown
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

const NewBillPage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [suppliers, setSuppliers] = useState([]);
    const [items, setItems] = useState([]);
    const [showItemSearch, setShowItemSearch] = useState(false);
    const [itemSearchTerm, setItemSearchTerm] = useState('');

    const [formData, setFormData] = useState({
        supplierId: '',
        billDate: new Date().toISOString().split('T')[0],
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
    }, []);

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
            const response = await apiRequest(API_ENDPOINTS.bills, {
                method: 'POST',
                body: JSON.stringify({
                    ...formData,
                    items: billItems
                })
            });

            if (response.success) {
                navigate('/purchases/bills');
            } else {
                setErrors({ submit: response.error || 'Failed to create bill' });
            }
        } catch (error) {
            console.error('Error creating bill:', error);
            setErrors({ submit: 'Failed to create bill' });
        } finally {
            setLoading(false);
        }
    };

    const totals = calculateTotals();
    const filteredItems = items.filter(item => 
        item.name?.toLowerCase().includes(itemSearchTerm.toLowerCase()) ||
        item.sku?.toLowerCase().includes(itemSearchTerm.toLowerCase())
    );

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
                                <h1 className="text-2xl font-bold text-gray-900">New Bill</h1>
                                <p className="text-sm text-gray-500">Record a new vendor bill</p>
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
                                className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all disabled:opacity-50"
                            >
                                <FiSave className="w-5 h-5" />
                                {loading ? 'Saving...' : 'Save Bill'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-8">
                {errors.submit && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600">
                        {errors.submit}
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Form */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Bill Details */}
                        <SectionCard title="Bill Details" icon={FiFileText}>
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
                                <FormSelect
                                    label="Status"
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                    options={[
                                        { value: 'draft', label: 'Draft' },
                                        { value: 'open', label: 'Open' }
                                    ]}
                                />
                                <FormInput
                                    label="Bill Date *"
                                    type="date"
                                    icon={FiCalendar}
                                    value={formData.billDate}
                                    onChange={(e) => setFormData({ ...formData, billDate: e.target.value })}
                                    error={errors.billDate}
                                />
                                <FormInput
                                    label="Due Date *"
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
                                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                                    {errors.items}
                                </div>
                            )}

                            {/* Add Item Button */}
                            <div className="mb-6">
                                <button
                                    type="button"
                                    onClick={() => setShowItemSearch(true)}
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl font-medium hover:bg-blue-100 transition-colors"
                                >
                                    <FiPlus className="w-5 h-5" />
                                    Add Item
                                </button>
                            </div>

                            {/* Items Table */}
                            {billItems.length > 0 && (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="text-left text-sm text-gray-600 border-b border-gray-100">
                                                <th className="pb-3 font-medium">Item</th>
                                                <th className="pb-3 font-medium text-center">Qty</th>
                                                <th className="pb-3 font-medium text-right">Price</th>
                                                <th className="pb-3 font-medium text-right">Discount</th>
                                                <th className="pb-3 font-medium text-right">Tax %</th>
                                                <th className="pb-3 font-medium text-right">Total</th>
                                                <th className="pb-3"></th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {billItems.map((item, index) => (
                                                <tr key={index} className="group">
                                                    <td className="py-3">
                                                        <div>
                                                            <div className="font-medium text-gray-900">{item.itemName}</div>
                                                            <div className="text-sm text-gray-500">{item.sku}</div>
                                                        </div>
                                                    </td>
                                                    <td className="py-3">
                                                        <input
                                                            type="number"
                                                            min="1"
                                                            value={item.quantity}
                                                            onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 1)}
                                                            className="w-20 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-center focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                                        />
                                                    </td>
                                                    <td className="py-3">
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            step="0.01"
                                                            value={item.unitPrice}
                                                            onChange={(e) => handleItemChange(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                                                            className="w-24 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-right focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                                        />
                                                    </td>
                                                    <td className="py-3">
                                                        <div className="flex items-center gap-1">
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                value={item.discount}
                                                                onChange={(e) => handleItemChange(index, 'discount', parseFloat(e.target.value) || 0)}
                                                                className="w-20 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-right focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                                            />
                                                            <select
                                                                value={item.discountType}
                                                                onChange={(e) => handleItemChange(index, 'discountType', e.target.value)}
                                                                className="px-2 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                                                            >
                                                                <option value="amount">Rs.</option>
                                                                <option value="percentage">%</option>
                                                            </select>
                                                        </div>
                                                    </td>
                                                    <td className="py-3">
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            max="100"
                                                            value={item.tax}
                                                            onChange={(e) => handleItemChange(index, 'tax', parseFloat(e.target.value) || 0)}
                                                            className="w-20 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-right focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                                        />
                                                    </td>
                                                    <td className="py-3 text-right font-semibold text-gray-900">
                                                        Rs. {calculateItemTotal(item).toFixed(2)}
                                                    </td>
                                                    <td className="py-3 text-center">
                                                        <button
                                                            onClick={() => handleRemoveItem(index)}
                                                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                                                        >
                                                            <FiTrash2 className="w-4 h-4" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {billItems.length === 0 && (
                                <div className="text-center py-8 text-gray-500">
                                    <FiPackage className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                    <p>No items added yet</p>
                                    <p className="text-sm">Click "Add Item" to add items to this bill</p>
                                </div>
                            )}
                        </SectionCard>

                        {/* Notes */}
                        <SectionCard title="Additional Information" icon={FiFileText}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Notes</label>
                                    <textarea
                                        value={formData.notes}
                                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                        rows="3"
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all"
                                        placeholder="Add any notes about this bill..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Terms & Conditions</label>
                                    <textarea
                                        value={formData.terms}
                                        onChange={(e) => setFormData({ ...formData, terms: e.target.value })}
                                        rows="3"
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all"
                                        placeholder="Enter terms and conditions..."
                                    />
                                </div>
                            </div>
                        </SectionCard>
                    </div>

                    {/* Summary Sidebar */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-32">
                            <h3 className="font-semibold text-gray-900 mb-4">Bill Summary</h3>
                            
                            <div className="space-y-3">
                                <div className="flex justify-between text-gray-600">
                                    <span>Subtotal</span>
                                    <span>Rs. {totals.subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Discount</span>
                                    <span className="text-red-500">-Rs. {totals.totalDiscount.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Tax</span>
                                    <span>Rs. {totals.totalTax.toFixed(2)}</span>
                                </div>
                                <div className="border-t border-gray-200 my-3" />
                                <div className="flex justify-between text-lg font-bold">
                                    <span>Grand Total</span>
                                    <span className="text-blue-600">Rs. {totals.grandTotal.toFixed(2)}</span>
                                </div>
                            </div>

                            <div className="mt-6 p-4 bg-blue-50 rounded-xl">
                                <div className="flex items-center gap-2 text-blue-700">
                                    <FiDollarSign className="w-5 h-5" />
                                    <span className="font-medium">Amount Due</span>
                                </div>
                                <div className="text-2xl font-bold text-blue-700 mt-1">
                                    Rs. {totals.grandTotal.toFixed(2)}
                                </div>
                            </div>

                            <button
                                onClick={handleSubmit}
                                disabled={loading}
                                className="w-full mt-6 inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all disabled:opacity-50"
                            >
                                <FiSave className="w-5 h-5" />
                                {loading ? 'Saving...' : 'Save Bill'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Item Search Modal */}
            {showItemSearch && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[80vh] overflow-hidden">
                        <div className="p-6 border-b border-gray-100">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-900">Add Item</h3>
                                <button
                                    onClick={() => setShowItemSearch(false)}
                                    className="p-2 hover:bg-gray-100 rounded-lg"
                                >
                                    <FiX className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="relative">
                                <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search items by name or SKU..."
                                    value={itemSearchTerm}
                                    onChange={(e) => setItemSearchTerm(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                    autoFocus
                                />
                            </div>
                        </div>
                        <div className="max-h-96 overflow-y-auto p-4">
                            {filteredItems.length > 0 ? (
                                <div className="space-y-2">
                                    {filteredItems.map(item => (
                                        <button
                                            key={item.id}
                                            onClick={() => handleAddItem(item)}
                                            className="w-full flex items-center gap-4 p-4 hover:bg-blue-50 rounded-xl transition-colors text-left"
                                        >
                                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white font-semibold">
                                                {item.name?.charAt(0)}
                                            </div>
                                            <div className="flex-1">
                                                <div className="font-medium text-gray-900">{item.name}</div>
                                                <div className="text-sm text-gray-500">SKU: {item.sku}</div>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-semibold text-gray-900">Rs. {item.costPrice || 0}</div>
                                                <div className="text-sm text-gray-500">Stock: {item.stockOnHand || 0}</div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-500">
                                    <FiPackage className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                    <p>No items found</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NewBillPage;
