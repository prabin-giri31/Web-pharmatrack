import { Op } from "sequelize";
import { Item, Customer, SalesOrder } from "../../Model/index.js";

export const globalSearch = async (req, res) => {
  try {
    const query = (req.query.q || "").trim();
    if (!query) {
      return res.status(200).json({ items: [], customers: [], salesOrders: [] });
    }

    const userId = req.user.userId;
    const like = `%${query}%`;

    const [items, customers, salesOrders] = await Promise.all([
      Item.findAll({
        where: {
          userId,
          name: { [Op.iLike]: like },
        },
        attributes: ["id", "name", "sku", "stockOnHand", "sellingPrice"],
        limit: 20,
      }),
      Customer.findAll({
        where: {
          userId,
          [Op.or]: [
            { name: { [Op.iLike]: like } },
            { email: { [Op.iLike]: like } },
          ],
        },
        attributes: ["id", "name", "company", "email", "phone"],
        limit: 20,
      }),
      SalesOrder.findAll({
        where: {
          userId,
          orderNumber: { [Op.iLike]: like },
        },
        attributes: ["id", "orderNumber", "status", "orderDate", "customerId"],
        limit: 20,
      }),
    ]);

    return res.status(200).json({ items, customers, salesOrders });
  } catch (error) {
    console.error("Search Error:", error);
    return res.status(500).json({ message: "Failed to search" });
  }
};
