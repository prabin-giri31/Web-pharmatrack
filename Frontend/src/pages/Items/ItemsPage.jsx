import { useState } from "react";
import ItemsHeader from "../../Components/private/items/ItemsHeader";
import ItemsTable from "../../Components/private/items/ItemsTable";

const ItemsPage = () => {
  const [view, setView] = useState("list");
  const [filter, setFilter] = useState("All Items");

  return (
    <>
      <ItemsHeader view={view} setView={setView} filter={filter} setFilter={setFilter} />
      <div className="p-3 sm:p-6">
        <ItemsTable view={view} filter={filter} />
      </div>
    </>
  );
};

export default ItemsPage;
