import InventoryAdjustmentForm from "../../Components/private/Inventory/InventoryAdjustmentList";

const InventoryAdjustmentPage = () => {
  // TODO: Fetch products from API
  const products = [
    { id: 1, name: "Product A" },
    { id: 2, name: "Product B" },
    { id: 3, name: "Product C" },
  ];

  const handleSubmit = (data) => {
    console.log("Adjustment submitted:", data);
    // TODO: Send to API
  };

  return (
    <InventoryAdjustmentForm 
      products={products}
      onSubmit={handleSubmit}
    />
  );
};

export default InventoryAdjustmentPage;
