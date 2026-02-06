import { Op, fn, col } from "sequelize";
import { User, UserActivity } from "../../Model/index.js";

// GET /api/super-admin/activities - Get all user activities
export const getAllActivities = async (req, res) => {
  try {
    const { 
      userId, 
      action, 
      isSuspicious, 
      startDate, 
      endDate, 
      page = 1, 
      limit = 50 
    } = req.query;
    
    const where = {};
    
    if (userId) {
      where.userId = userId;
    }
    
    if (action) {
      where.action = action;
    }
    
    if (isSuspicious !== undefined) {
      where.isSuspicious = isSuspicious === "true";
    }
    
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt[Op.gte] = new Date(startDate);
      }
      if (endDate) {
        where.createdAt[Op.lte] = new Date(endDate);
      }
    }
    
    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    const { rows: activities, count: total } = await UserActivity.findAndCountAll({
      where,
      include: [{
        model: User,
        as: "user",
        attributes: ["id", "ownerName", "pharmacyName", "email"]
      }],
      order: [["createdAt", "DESC"]],
      limit: parseInt(limit),
      offset
    });
    
    res.status(200).json({
      activities: activities.map(a => ({
        id: a.id,
        action: a.action,
        description: a.description,
        resourceType: a.resourceType,
        resourceId: a.resourceId,
        ipAddress: a.ipAddress,
        userAgent: a.userAgent,
        isSuspicious: a.isSuspicious,
        metadata: a.metadata,
        createdAt: a.createdAt,
        user: a.user ? {
          id: a.user.id,
          name: a.user.ownerName,
          pharmacy: a.user.pharmacyName,
          email: a.user.email
        } : null
      })),
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error("Get Activities Error:", error);
    res.status(500).json({ message: "Failed to fetch activities" });
  }
};

// GET /api/super-admin/activities/login-history - Get login history
export const getLoginHistory = async (req, res) => {
  try {
    const { userId, page = 1, limit = 50 } = req.query;
    
    const where = {
      action: { [Op.in]: ["LOGIN", "LOGIN_FAILED", "LOGOUT"] }
    };
    
    if (userId) {
      where.userId = userId;
    }
    
    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    const { rows: logins, count: total } = await UserActivity.findAndCountAll({
      where,
      include: [{
        model: User,
        as: "user",
        attributes: ["id", "ownerName", "pharmacyName", "email"]
      }],
      order: [["createdAt", "DESC"]],
      limit: parseInt(limit),
      offset
    });
    
    res.status(200).json({
      logins: logins.map(l => ({
        id: l.id,
        action: l.action,
        description: l.description,
        ipAddress: l.ipAddress,
        userAgent: l.userAgent,
        isSuspicious: l.isSuspicious,
        createdAt: l.createdAt,
        user: l.user ? {
          id: l.user.id,
          name: l.user.ownerName,
          pharmacy: l.user.pharmacyName,
          email: l.user.email
        } : null
      })),
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error("Get Login History Error:", error);
    res.status(500).json({ message: "Failed to fetch login history" });
  }
};

// GET /api/super-admin/activities/suspicious - Get suspicious activities
export const getSuspiciousActivities = async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    const { rows: activities, count: total } = await UserActivity.findAndCountAll({
      where: { isSuspicious: true },
      include: [{
        model: User,
        as: "user",
        attributes: ["id", "ownerName", "pharmacyName", "email", "status"]
      }],
      order: [["createdAt", "DESC"]],
      limit: parseInt(limit),
      offset
    });
    
    res.status(200).json({
      activities: activities.map(a => ({
        id: a.id,
        action: a.action,
        description: a.description,
        ipAddress: a.ipAddress,
        userAgent: a.userAgent,
        metadata: a.metadata,
        createdAt: a.createdAt,
        user: a.user ? {
          id: a.user.id,
          name: a.user.ownerName,
          pharmacy: a.user.pharmacyName,
          email: a.user.email,
          status: a.user.status
        } : null
      })),
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error("Get Suspicious Activities Error:", error);
    res.status(500).json({ message: "Failed to fetch suspicious activities" });
  }
};

// GET /api/super-admin/activities/stats - Get activity statistics
export const getActivityStats = async (req, res) => {
  try {
    const today = new Date();
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const [
      totalActivities,
      todayActivities,
      suspiciousCount,
      activityByAction,
      activityByDay
    ] = await Promise.all([
      UserActivity.count(),
      UserActivity.count({
        where: {
          createdAt: { [Op.gte]: new Date(today.setHours(0, 0, 0, 0)) }
        }
      }),
      UserActivity.count({ where: { isSuspicious: true } }),
      UserActivity.findAll({
        attributes: [
          "action",
          [fn("COUNT", col("id")), "count"]
        ],
        group: ["action"],
        order: [[fn("COUNT", col("id")), "DESC"]],
        limit: 10,
        raw: true
      }),
      UserActivity.findAll({
        where: {
          createdAt: { [Op.gte]: sevenDaysAgo }
        },
        attributes: [
          [fn("DATE", col("createdAt")), "date"],
          [fn("COUNT", col("id")), "count"]
        ],
        group: [fn("DATE", col("createdAt"))],
        order: [[fn("DATE", col("createdAt")), "ASC"]],
        raw: true
      })
    ]);
    
    res.status(200).json({
      totalActivities,
      todayActivities,
      suspiciousCount,
      activityByAction,
      activityByDay
    });
  } catch (error) {
    console.error("Get Activity Stats Error:", error);
    res.status(500).json({ message: "Failed to fetch activity stats" });
  }
};

// POST /api/super-admin/activities/:id/mark-suspicious - Mark activity as suspicious
export const markAsSuspicious = async (req, res) => {
  try {
    const { id } = req.params;
    const { isSuspicious = true } = req.body;
    
    const activity = await UserActivity.findByPk(id);
    
    if (!activity) {
      return res.status(404).json({ message: "Activity not found" });
    }
    
    await activity.update({ isSuspicious });
    
    res.status(200).json({ message: `Activity marked as ${isSuspicious ? "suspicious" : "normal"}` });
  } catch (error) {
    console.error("Mark Suspicious Error:", error);
    res.status(500).json({ message: "Failed to update activity" });
  }
};

// DELETE /api/super-admin/activities/clear - Clear old activities
export const clearOldActivities = async (req, res) => {
  try {
    const { daysOld = 90 } = req.body;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - parseInt(daysOld));
    
    const deletedCount = await UserActivity.destroy({
      where: {
        createdAt: { [Op.lt]: cutoffDate },
        isSuspicious: false // Don't delete suspicious activities
      }
    });
    
    res.status(200).json({ 
      message: `Cleared ${deletedCount} activities older than ${daysOld} days` 
    });
  } catch (error) {
    console.error("Clear Activities Error:", error);
    res.status(500).json({ message: "Failed to clear activities" });
  }
};
