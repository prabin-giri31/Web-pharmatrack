import { useEffect, useMemo, useState } from "react";
import { FiFileText, FiPlus, FiTrash2, FiUpload, FiUser, FiMapPin, FiUsers, FiBriefcase, FiDollarSign, FiTag, FiMessageSquare, FiChevronLeft, FiStar, FiCheck, FiAlertCircle } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { API_ENDPOINTS, apiRequest } from "../../config/api";

const buildDisplayName = (data) => {
  if (data.companyName?.trim()) return data.companyName.trim();
  const fullName = [data.salutation, data.firstName, data.lastName]
    .filter(Boolean)
    .join(" ")
    .trim();
  return fullName;
};

// Reusable Input Component
const FormInput = ({ label, required, error, className = "", ...props }) => (
  <div className={className}>
    <label className="block text-sm font-medium text-gray-700 mb-1.5">
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
    <input
      {...props}
      className={`w-full px-4 py-2.5 border rounded-xl transition-all duration-200 outline-none
        ${error 
          ? "border-red-400 bg-red-50 focus:ring-2 focus:ring-red-200" 
          : "border-gray-200 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 hover:border-gray-300"
        }`}
    />
    {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
  </div>
);

// Reusable Select Component
const FormSelect = ({ label, required, children, className = "", ...props }) => (
  <div className={className}>
    <label className="block text-sm font-medium text-gray-700 mb-1.5">
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
    <select
      {...props}
      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-white transition-all duration-200 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 hover:border-gray-300"
    >
      {children}
    </select>
  </div>
);

// Reusable Textarea Component
const FormTextarea = ({ label, className = "", ...props }) => (
  <div className={className}>
    <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
    <textarea
      {...props}
      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-white transition-all duration-200 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 hover:border-gray-300 resize-none"
    />
  </div>
);

// Section Card Component
const SectionCard = ({ icon: Icon, title, description, children, action }) => (
  <section className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200">
    <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Icon className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
            {description && <p className="text-sm text-gray-500">{description}</p>}
          </div>
        </div>
        {action}
      </div>
    </div>
    <div className="p-6">{children}</div>
  </section>
);

const NewVendorPage = () => {
  const navigate = useNavigate();
  const [autoDisplayName, setAutoDisplayName] = useState(true);
  const [message, setMessage] = useState(null);
  const [saving, setSaving] = useState(false);
  const [fileError, setFileError] = useState("");

  const [formData, setFormData] = useState({
    salutation: "",
    firstName: "",
    lastName: "",
    companyName: "",
    displayName: "",
    email: "",
    phone: "",
    workPhone: "",
    mobileNumber: "",
    billingAddress: "",
    shippingAddress: "",
    city: "",
    stateProvince: "",
    postalCode: "",
    country: "",
    registrationId: "",
    panVatNumber: "",
    taxRate: "",
    taxGroup: "",
    businessType: "",
    currency: "NPR",
    paymentTerms: "Due on receipt",
    bankDetails: "",
    creditLimit: "",
    region: "",
    supplierCategory: "",
    preferredSupplier: false,
    notes: "",
    specialInstructions: "",
    purchaseRemarks: "",
  });

  const [contactPersons, setContactPersons] = useState([
    { name: "", designation: "", email: "", phone: "" },
  ]);
  const [documents, setDocuments] = useState([]);
  const [customFields, setCustomFields] = useState([{ key: "", value: "" }]);

  useEffect(() => {
    if (!autoDisplayName) return;
    setFormData((prev) => ({
      ...prev,
      displayName: buildDisplayName(prev),
    }));
  }, [
    autoDisplayName,
    formData.salutation,
    formData.firstName,
    formData.lastName,
    formData.companyName,
  ]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleContactChange = (index, field, value) => {
    setContactPersons((prev) =>
      prev.map((item, idx) => (idx === index ? { ...item, [field]: value } : item))
    );
  };

  const addContactPerson = () => {
    setContactPersons((prev) => [...prev, { name: "", designation: "", email: "", phone: "" }]);
  };

  const removeContactPerson = (index) => {
    setContactPersons((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleCustomFieldChange = (index, field, value) => {
    setCustomFields((prev) =>
      prev.map((item, idx) => (idx === index ? { ...item, [field]: value } : item))
    );
  };

  const addCustomField = () => {
    setCustomFields((prev) => [...prev, { key: "", value: "" }]);
  };

  const removeCustomField = (index) => {
    setCustomFields((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleDocumentsChange = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    setFileError("");
    const totalFiles = documents.length + files.length;
    if (totalFiles > 10) {
      setFileError("You can upload a maximum of 10 files.");
      return;
    }

    const oversized = files.find((file) => file.size > 10 * 1024 * 1024);
    if (oversized) {
      setFileError("Each file must be 10MB or smaller.");
      return;
    }

    const readFile = (file) =>
      new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve({ name: file.name, size: file.size, type: file.type, content: reader.result });
        reader.readAsDataURL(file);
      });

    const newDocs = await Promise.all(files.map(readFile));
    setDocuments((prev) => [...prev, ...newDocs]);
  };

  const removeDocument = (index) => {
    setDocuments((prev) => prev.filter((_, idx) => idx !== index));
  };

  const requiredErrors = useMemo(() => {
    const errors = {};
    if (!formData.displayName.trim()) errors.displayName = "Display name is required.";
    if (!formData.email.trim()) errors.email = "Email address is required.";
    if (!formData.phone.trim()) errors.phone = "Phone number is required.";
    return errors;
  }, [formData.displayName, formData.email, formData.phone]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);

    if (Object.keys(requiredErrors).length) {
      setMessage({ type: "error", text: "Please fill all required fields." });
      return;
    }

    setSaving(true);
    const customFieldPayload = customFields.reduce((acc, field) => {
      if (field.key.trim()) {
        acc[field.key.trim()] = field.value;
      }
      return acc;
    }, {});

    const payload = {
      ...formData,
      contactPersons: contactPersons.filter((person) => person.name || person.email || person.phone),
      documents,
      customFields: customFieldPayload,
    };

    const result = await apiRequest(API_ENDPOINTS.suppliers, {
      method: "POST",
      body: JSON.stringify(payload),
    });

    if (result.success) {
      navigate("/purchases/suppliers", { state: { message: "Vendor created successfully." } });
    } else {
      setMessage({ type: "error", text: result.error || "Failed to create vendor." });
    }
    setSaving(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => navigate("/purchases/suppliers")}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FiChevronLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg shadow-blue-200">
                  <FiUser className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-900">New Vendor</h1>
                  <p className="text-sm text-gray-500">Add a new vendor to your supply chain</p>
                </div>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-3">
              <button
                type="button"
                onClick={() => navigate("/purchases/suppliers")}
                className="px-4 py-2.5 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="vendor-form"
                disabled={saving}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-200 font-medium transition-all disabled:opacity-60"
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <FiCheck className="w-4 h-4" />
                    Save Vendor
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Alert Messages */}
        {message && (
          <div
            className={`mb-6 flex items-center gap-3 rounded-xl px-4 py-3 border shadow-sm ${
              message.type === "success"
                ? "bg-green-50 text-green-700 border-green-200"
                : "bg-red-50 text-red-700 border-red-200"
            }`}
          >
            {message.type === "success" ? (
              <FiCheck className="w-5 h-5" />
            ) : (
              <FiAlertCircle className="w-5 h-5" />
            )}
            <span className="font-medium">{message.text}</span>
          </div>
        )}

        <form id="vendor-form" onSubmit={handleSubmit} className="space-y-6">
          {/* Primary Contact Information */}
          <SectionCard
            icon={FiUser}
            title="Primary Contact Information"
            description="Basic vendor identification details"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              <FormSelect
                label="Salutation"
                name="salutation"
                value={formData.salutation}
                onChange={handleChange}
              >
                <option value="">Select</option>
                <option>Mr.</option>
                <option>Ms.</option>
                <option>Dr.</option>
                <option>Company</option>
              </FormSelect>
              
              <FormInput
                label="First Name"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="Enter first name"
              />
              
              <FormInput
                label="Last Name"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Enter last name"
              />
              
              <FormInput
                label="Company Name"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                placeholder="Enter company name"
              />
              
              <div>
                <FormInput
                  label="Display Name"
                  name="displayName"
                  value={formData.displayName}
                  onChange={(e) => {
                    setAutoDisplayName(false);
                    handleChange(e);
                  }}
                  placeholder="Display name"
                  required
                  error={requiredErrors.displayName}
                />
                <label className="mt-2 flex items-center gap-2 text-xs text-gray-500 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoDisplayName}
                    onChange={(e) => setAutoDisplayName(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  Auto-generate display name
                </label>
              </div>
              
              <FormInput
                label="Email Address"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="vendor@example.com"
                required
                error={requiredErrors.email}
              />
              
              <FormInput
                label="Phone Number"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+977 98XXXXXXXX"
                required
                error={requiredErrors.phone}
              />
              
              <FormInput
                label="Work Phone"
                name="workPhone"
                value={formData.workPhone}
                onChange={handleChange}
                placeholder="Work phone number"
              />
              
              <FormInput
                label="Mobile Number"
                name="mobileNumber"
                value={formData.mobileNumber}
                onChange={handleChange}
                placeholder="Mobile number"
              />
            </div>
          </SectionCard>

          {/* Address Details */}
          <SectionCard
            icon={FiMapPin}
            title="Vendor Address Details"
            description="Billing and shipping addresses"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <FormInput
                label="Billing Address"
                name="billingAddress"
                value={formData.billingAddress}
                onChange={handleChange}
                placeholder="Enter billing address"
              />
              
              <FormInput
                label="Shipping Address"
                name="shippingAddress"
                value={formData.shippingAddress}
                onChange={handleChange}
                placeholder="Enter shipping address"
              />
              
              <FormInput
                label="City"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="City"
              />
              
              <FormInput
                label="State / Province"
                name="stateProvince"
                value={formData.stateProvince}
                onChange={handleChange}
                placeholder="State or Province"
              />
              
              <FormInput
                label="Postal Code"
                name="postalCode"
                value={formData.postalCode}
                onChange={handleChange}
                placeholder="Postal code"
              />
              
              <FormInput
                label="Country"
                name="country"
                value={formData.country}
                onChange={handleChange}
                placeholder="Country"
              />
            </div>
          </SectionCard>

          {/* Contact Persons */}
          <SectionCard
            icon={FiUsers}
            title="Contact Persons"
            description="Additional contacts for this vendor"
            action={
              <button
                type="button"
                onClick={addContactPerson}
                className="inline-flex items-center gap-2 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg font-medium transition-colors"
              >
                <FiPlus className="w-4 h-4" /> Add Contact
              </button>
            }
          >
            <div className="space-y-4">
              {contactPersons.map((person, index) => (
                <div
                  key={`contact-${index}`}
                  className="p-4 bg-gray-50 rounded-xl border border-gray-100"
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium text-gray-600">Contact #{index + 1}</span>
                    {contactPersons.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeContactPerson(index)}
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        aria-label="Remove contact"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <FormInput
                      label="Name"
                      value={person.name}
                      onChange={(e) => handleContactChange(index, "name", e.target.value)}
                      placeholder="Contact name"
                    />
                    <FormInput
                      label="Designation"
                      value={person.designation}
                      onChange={(e) => handleContactChange(index, "designation", e.target.value)}
                      placeholder="Job title"
                    />
                    <FormInput
                      label="Email"
                      type="email"
                      value={person.email}
                      onChange={(e) => handleContactChange(index, "email", e.target.value)}
                      placeholder="Email address"
                    />
                    <FormInput
                      label="Phone"
                      value={person.phone}
                      onChange={(e) => handleContactChange(index, "phone", e.target.value)}
                      placeholder="Phone number"
                    />
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>

          {/* Business & Tax Information */}
          <SectionCard
            icon={FiBriefcase}
            title="Business & Tax Information"
            description="Legal and tax-related details"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              <FormInput
                label="Company Registration ID"
                name="registrationId"
                value={formData.registrationId}
                onChange={handleChange}
                placeholder="Registration ID"
              />
              
              <FormInput
                label="PAN / VAT Number"
                name="panVatNumber"
                value={formData.panVatNumber}
                onChange={handleChange}
                placeholder="PAN or VAT number"
              />
              
              <FormInput
                label="Tax Rate (%)"
                name="taxRate"
                type="number"
                step="0.01"
                value={formData.taxRate}
                onChange={handleChange}
                placeholder="0.00"
              />
              
              <FormInput
                label="Tax Group"
                name="taxGroup"
                value={formData.taxGroup}
                onChange={handleChange}
                placeholder="Tax group"
              />
              
              <FormInput
                label="Business Type"
                name="businessType"
                value={formData.businessType}
                onChange={handleChange}
                placeholder="e.g., Manufacturer, Distributor"
              />
            </div>
          </SectionCard>

          {/* Financial Information */}
          <SectionCard
            icon={FiDollarSign}
            title="Financial Information"
            description="Payment and banking details"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              <FormSelect
                label="Currency"
                name="currency"
                value={formData.currency}
                onChange={handleChange}
              >
                <option value="NPR">NPR - Nepalese Rupee (Rs.)</option>
              </FormSelect>
              
              <FormSelect
                label="Payment Terms"
                name="paymentTerms"
                value={formData.paymentTerms}
                onChange={handleChange}
              >
                <option>Due on receipt</option>
                <option>Due in 15 days</option>
                <option>Due in 30 days</option>
                <option>Due in 45 days</option>
                <option>Due in 60 days</option>
              </FormSelect>
              
              <FormInput
                label="Credit Limit"
                name="creditLimit"
                type="number"
                step="0.01"
                value={formData.creditLimit}
                onChange={handleChange}
                placeholder="0.00"
              />
              
              <FormTextarea
                label="Bank Details (optional)"
                name="bankDetails"
                value={formData.bankDetails}
                onChange={handleChange}
                rows={3}
                placeholder="Bank name, account number, branch..."
                className="md:col-span-2 lg:col-span-3"
              />
            </div>
          </SectionCard>

          {/* Documents Upload */}
          <SectionCard
            icon={FiUpload}
            title="Documents Upload"
            description="Contracts, licenses, agreements"
          >
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-blue-400 hover:bg-blue-50/50 transition-all cursor-pointer">
                <label className="cursor-pointer">
                  <input type="file" multiple className="hidden" onChange={handleDocumentsChange} />
                  <div className="flex flex-col items-center gap-3">
                    <div className="p-3 bg-blue-100 rounded-full">
                      <FiUpload className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Click to upload documents</p>
                      <p className="text-xs text-gray-500 mt-1">Max 10 files, 10MB each • PDF, DOC, Images</p>
                    </div>
                  </div>
                </label>
              </div>
              
              {fileError && (
                <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
                  <FiAlertCircle className="w-4 h-4" />
                  {fileError}
                </div>
              )}
              
              {documents.length > 0 && (
                <div className="space-y-2">
                  {documents.map((doc, index) => (
                    <div
                      key={`doc-${index}`}
                      className="flex items-center justify-between px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm group hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-white rounded-lg border border-gray-200">
                          <FiFileText className="w-4 h-4 text-gray-500" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-700">{doc.name}</p>
                          <p className="text-xs text-gray-500">{(doc.size / 1024).toFixed(1)} KB</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeDocument(index)}
                        className="text-red-500 hover:text-red-600 hover:bg-red-50 p-1.5 rounded-lg transition-colors"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </SectionCard>

          {/* Custom Fields */}
          <SectionCard
            icon={FiPlus}
            title="Custom Fields"
            description="Add any additional information"
            action={
              <button
                type="button"
                onClick={addCustomField}
                className="inline-flex items-center gap-2 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg font-medium transition-colors"
              >
                <FiPlus className="w-4 h-4" /> Add Field
              </button>
            }
          >
            <div className="space-y-3">
              {customFields.map((field, index) => (
                <div
                  key={`custom-${index}`}
                  className="flex items-end gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100"
                >
                  <FormInput
                    label="Field Name"
                    value={field.key}
                    onChange={(e) => handleCustomFieldChange(index, "key", e.target.value)}
                    placeholder="e.g., License Number"
                    className="flex-1"
                  />
                  <FormInput
                    label="Field Value"
                    value={field.value}
                    onChange={(e) => handleCustomFieldChange(index, "value", e.target.value)}
                    placeholder="Enter value"
                    className="flex-1"
                  />
                  {customFields.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeCustomField(index)}
                      className="p-2.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors mb-0.5"
                      aria-label="Remove custom field"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </SectionCard>

          {/* Reporting Tags */}
          <SectionCard
            icon={FiTag}
            title="Reporting Tags"
            description="Categorization and preferences"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              <FormInput
                label="Region"
                name="region"
                value={formData.region}
                onChange={handleChange}
                placeholder="e.g., Kathmandu, Pokhara"
              />
              
              <FormInput
                label="Supplier Category"
                name="supplierCategory"
                value={formData.supplierCategory}
                onChange={handleChange}
                placeholder="e.g., Pharmaceuticals, Medical"
              />
              
              <div className="flex items-end">
                <label className="flex items-center gap-3 p-4 bg-gradient-to-r from-amber-50 to-amber-100 border border-amber-200 rounded-xl cursor-pointer hover:shadow-md transition-all">
                  <input
                    type="checkbox"
                    name="preferredSupplier"
                    checked={formData.preferredSupplier}
                    onChange={handleChange}
                    className="w-5 h-5 rounded border-amber-300 text-amber-600 focus:ring-amber-500"
                  />
                  <div className="flex items-center gap-2">
                    <FiStar className={`w-5 h-5 ${formData.preferredSupplier ? "text-amber-500 fill-amber-500" : "text-amber-400"}`} />
                    <span className="font-medium text-amber-800">Preferred Supplier</span>
                  </div>
                </label>
              </div>
            </div>
          </SectionCard>

          {/* Additional Remarks */}
          <SectionCard
            icon={FiMessageSquare}
            title="Additional Remarks"
            description="Notes and special instructions"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <FormTextarea
                label="Vendor Notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={4}
                placeholder="General notes about this vendor..."
              />
              
              <FormTextarea
                label="Special Instructions"
                name="specialInstructions"
                value={formData.specialInstructions}
                onChange={handleChange}
                rows={4}
                placeholder="Delivery or handling instructions..."
              />
              
              <FormTextarea
                label="Purchase Remarks"
                name="purchaseRemarks"
                value={formData.purchaseRemarks}
                onChange={handleChange}
                rows={4}
                placeholder="Purchase-related comments..."
              />
            </div>
          </SectionCard>

          {/* Mobile Submit Buttons */}
          <div className="sm:hidden flex items-center gap-3 sticky bottom-4">
            <button
              type="button"
              onClick={() => navigate("/purchases/suppliers")}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-xl text-gray-700 bg-white hover:bg-gray-50 font-medium shadow-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 shadow-lg font-medium disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save Vendor"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewVendorPage;
