import { SystemSettings, UserActivity, User, Item, Invoice, Customer, SalesOrder } from "../../Model/index.js";
import { sequelize } from "../../Database/db.js";
import { Op, fn, col } from "sequelize";

// Helper to log activity
const logActivity = async (userId, action, description, req, metadata = {}) => {
  try {
    await UserActivity.create({
      userId,
      action,
      description,
      ipAddress: req.ip || req.connection?.remoteAddress,
      userAgent: req.headers["user-agent"],
      metadata
    });
  } catch (error) {
    console.error("Failed to log activity:", error);
  }
};

// GET /api/super-admin/settings - Get all system settings
export const getSystemSettings = async (req, res) => {
  try {
    const { category } = req.query;
    
    const where = {};
    if (category) {
      where.category = category;
    }
    
    let settings = await SystemSettings.findAll({
      where,
      include: [{
        model: User,
        as: "updater",
        attributes: ["id", "ownerName", "email"]
      }],
      order: [["category", "ASC"], ["key", "ASC"]]
    });
    
    // If no settings exist, seed default settings
    if (settings.length === 0) {
      await SystemSettings.bulkCreate(SystemSettings.DEFAULT_SETTINGS);
      settings = await SystemSettings.findAll({
        where,
        order: [["category", "ASC"], ["key", "ASC"]]
      });
    }
    
    // Group by category
    const groupedSettings = settings.reduce((acc, setting) => {
      if (!acc[setting.category]) {
        acc[setting.category] = [];
      }
      acc[setting.category].push({
        id: setting.id,
        key: setting.key,
        value: parseSettingValue(setting.value, setting.type),
        type: setting.type,
        description: setting.description,
        isEditable: setting.isEditable,
        updatedAt: setting.updatedAt,
        updatedBy: setting.updater ? {
          id: setting.updater.id,
          name: setting.updater.ownerName
        } : null
      });
      return acc;
    }, {});
    
    res.status(200).json(groupedSettings);
  } catch (error) {
    console.error("Get Settings Error:", error);
    res.status(500).json({ message: "Failed to fetch settings" });
  }
};

// GET /api/super-admin/settings/:key - Get single setting
export const getSetting = async (req, res) => {
  try {
    const { key } = req.params;
    
    const setting = await SystemSettings.findOne({ where: { key } });
    
    if (!setting) {
      return res.status(404).json({ message: "Setting not found" });
    }
    
    res.status(200).json({
      key: setting.key,
      value: parseSettingValue(setting.value, setting.type),
      type: setting.type,
      category: setting.category,
      description: setting.description
    });
  } catch (error) {
    console.error("Get Setting Error:", error);
    res.status(500).json({ message: "Failed to fetch setting" });
  }
};

// PATCH /api/super-admin/settings/:key - Update setting
export const updateSetting = async (req, res) => {
  try {
    const { key } = req.params;
    const { value } = req.body;
    const userId = req.user.userId;
    
    const setting = await SystemSettings.findOne({ where: { key } });
    
    if (!setting) {
      return res.status(404).json({ message: "Setting not found" });
    }
    
    if (!setting.isEditable) {
      return res.status(400).json({ message: "This setting cannot be modified" });
    }
    
    // Validate value based on type
    const stringValue = stringifySettingValue(value, setting.type);
    
    const oldValue = setting.value;
    await setting.update({
      value: stringValue,
      updatedBy: userId
    });
    
    await logActivity(userId, "SETTING_UPDATED", `Updated setting ${key} from "${oldValue}" to "${stringValue}"`, req, { key, oldValue, newValue: stringValue });
    
    res.status(200).json({ 
      message: "Setting updated successfully",
      setting: {
        key: setting.key,
        value: parseSettingValue(setting.value, setting.type),
        type: setting.type
      }
    });
  } catch (error) {
    console.error("Update Setting Error:", error);
    res.status(500).json({ message: "Failed to update setting" });
  }
};

// PATCH /api/super-admin/settings - Bulk update settings
export const bulkUpdateSettings = async (req, res) => {
  try {
    const { settings } = req.body;
    const userId = req.user.userId;
    
    if (!Array.isArray(settings) || settings.length === 0) {
      return res.status(400).json({ message: "Settings array is required" });
    }
    
    const results = [];
    
    for (const { key, value } of settings) {
      const setting = await SystemSettings.findOne({ where: { key } });
      
      if (!setting) {
        results.push({ key, success: false, message: "Not found" });
        continue;
      }
      
      if (!setting.isEditable) {
        results.push({ key, success: false, message: "Not editable" });
        continue;
      }
      
      const stringValue = stringifySettingValue(value, setting.type);
      await setting.update({ value: stringValue, updatedBy: userId });
      results.push({ key, success: true });
    }
    
    await logActivity(userId, "SETTINGS_BULK_UPDATE", `Bulk updated ${settings.length} settings`, req);
    
    res.status(200).json({ message: "Settings updated", results });
  } catch (error) {
    console.error("Bulk Update Settings Error:", error);
    res.status(500).json({ message: "Failed to update settings" });
  }
};

// POST /api/super-admin/settings/reset - Reset to defaults
export const resetToDefaults = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { category } = req.body;
    
    const where = category ? { category } : {};
    
    await SystemSettings.destroy({ where });
    
    const defaultsToInsert = category 
      ? SystemSettings.DEFAULT_SETTINGS.filter(s => s.category === category)
      : SystemSettings.DEFAULT_SETTINGS;
    
    await SystemSettings.bulkCreate(defaultsToInsert);
    
    await logActivity(userId, "SETTINGS_RESET", `Reset settings to defaults${category ? ` for category: ${category}` : ""}`, req);
    
    res.status(200).json({ message: "Settings reset to defaults" });
  } catch (error) {
    console.error("Reset Settings Error:", error);
    res.status(500).json({ message: "Failed to reset settings" });
  }
};

// GET /api/super-admin/data/export - Export system data
export const exportData = async (req, res) => {
  try {
    const { type = "all" } = req.query;
    const userId = req.user.userId;
    
    let data = {};
    
    if (type === "all" || type === "users") {
      data.users = await User.findAll({
        attributes: { exclude: ["password", "passwordResetToken", "passwordResetExpires"] }
      });
    }
    
    if (type === "all" || type === "items") {
      data.items = await Item.findAll();
    }
    
    if (type === "all" || type === "customers") {
      data.customers = await Customer.findAll();
    }
    
    if (type === "all" || type === "invoices") {
      data.invoices = await Invoice.findAll();
    }
    
    if (type === "all" || type === "settings") {
      data.settings = await SystemSettings.findAll();
    }
    
    await logActivity(userId, "DATA_EXPORT", `Exported ${type} data`, req);
    
    res.status(200).json({
      exportedAt: new Date().toISOString(),
      type,
      data
    });
  } catch (error) {
    console.error("Export Data Error:", error);
    res.status(500).json({ message: "Failed to export data" });
  }
};

// POST /api/super-admin/data/backup - Create database backup info
export const createBackup = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    // Get database statistics
    const [userCount, itemCount, invoiceCount, customerCount, orderCount] = await Promise.all([
      User.count(),
      Item.count(),
      Invoice.count(),
      Customer.count(),
      SalesOrder.count()
    ]);
    
    const backupInfo = {
      timestamp: new Date().toISOString(),
      database: process.env.DB_NAME || "pharmatrack",
      statistics: {
        users: userCount,
        items: itemCount,
        invoices: invoiceCount,
        customers: customerCount,
        salesOrders: orderCount
      },
      message: "Backup information generated. For full database backup, use database admin tools."
    };
    
    await logActivity(userId, "BACKUP_CREATED", `Created backup info`, req);
    
    res.status(200).json(backupInfo);
  } catch (error) {
    console.error("Create Backup Error:", error);
    res.status(500).json({ message: "Failed to create backup" });
  }
};

// GET /api/super-admin/reports/summary - Get summary report
export const getSummaryReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const dateFilter = {};
    if (startDate) dateFilter[Op.gte] = new Date(startDate);
    if (endDate) dateFilter[Op.lte] = new Date(endDate);
    
    const invoiceWhere = startDate || endDate ? { invoiceDate: dateFilter } : {};
    const activityWhere = startDate || endDate ? { createdAt: dateFilter } : {};
    
    const [
      totalSales,
      invoiceCount,
      newUsers,
      newCustomers,
      activityCount,
      topSellingItems
    ] = await Promise.all([
      Invoice.sum("netPayable", { where: invoiceWhere }),
      Invoice.count({ where: invoiceWhere }),
      User.count({ where: startDate || endDate ? { createdAt: dateFilter } : {} }),
      Customer.count({ where: startDate || endDate ? { createdAt: dateFilter } : {} }),
      UserActivity.count({ where: activityWhere }),
      Item.findAll({
        attributes: ["id", "name", "sku"],
        limit: 10,
        order: [["stockOnHand", "DESC"]]
      })
    ]);
    
    res.status(200).json({
      period: {
        startDate: startDate || "All time",
        endDate: endDate || new Date().toISOString()
      },
      summary: {
        totalSales: Number(totalSales || 0),
        invoiceCount,
        newUsers,
        newCustomers,
        activityCount
      },
      topItems: topSellingItems
    });
  } catch (error) {
    console.error("Get Summary Report Error:", error);
    res.status(500).json({ message: "Failed to generate report" });
  }
};

// Helper functions
function parseSettingValue(value, type) {
  switch (type) {
    case "number":
      return Number(value);
    case "boolean":
      return value === "true";
    case "json":
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    default:
      return value;
  }
}

function stringifySettingValue(value, type) {
  switch (type) {
    case "json":
      return typeof value === "string" ? value : JSON.stringify(value);
    default:
      return String(value);
  }
}
