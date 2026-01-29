import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AddCustomerModal from "../../Components/private/Sales/AddCustomerModal";
import { API_ENDPOINTS, apiRequest } from "../../config/api";

const NewCustomerPage = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(true);

  const handleSave = async (customerData) => {
    const result = await apiRequest(API_ENDPOINTS.customers, {
      method: "POST",
      body: JSON.stringify(customerData),
    });
    if (result.success) {
      navigate("/sales/customers");
    }
    return result;
  };

  return (
    <AddCustomerModal
      isOpen={open}
      onClose={() => {
        setOpen(false);
        navigate("/sales/customers");
      }}
      onSave={handleSave}
    />
  );
};

export default NewCustomerPage;
