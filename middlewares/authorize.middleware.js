// authorize.middleware.js
const User = require("../models/user.model");

// .env dan SUPER_ROLES ni o'qiymiz (Masalan: SUPER_ROLES=1000,root)
const SUPER_ROLES = (process.env.SUPER_ROLES || 'root').split(',').map(r => r.trim());

const authorize = (options = {}) => {
  return async (req, res, next) => {
    try {
      const { roles: requiredRoles = [], permissions: requiredPermissions = [] } = options;

      const user = await User.findById(req.user.id).populate({
        path: 'roles',
        populate: { path: 'permissions', model: 'Permission' }
      });
console.log(user)
      if (!user) return res.status(404).json({ message: "Foydalanuvchi topilmadi" });

      // --- MUHIM: Status tekshiruvi ---
      // Sizning obyektingizda isActivated: false turibdi. 
      // Agar bu tekshiruv xalaqit bersa, vaqtincha olib tashlang yoki true qiling.
      if (user.isActive === false) {
        return res.status(403).json({ message: "Profilingiz faol emas!" });
      }

      const userRoleValues = user.roles.map(r => r.value); // Sizda bu ['1000']
      const userPermissionValues = [...new Set(user.roles.flatMap(role => 
        role.permissions ? role.permissions.map(p => p.value) : []
      ))];

      // --- 1. SUPER ADMIN BYPASS ---
      // Agar userRoleValues ichida '1000' bo'lsa (siz yuborgan logdagidek), to'g'ridan-to'g'ri o'tadi
      if (SUPER_ROLES.some(role => userRoleValues.includes(role))) {
        return next();
      }

      // --- 2. Oddiy Rol tekshiruvi ---
      if (requiredRoles.length > 0) {
        const hasRole = requiredRoles.some(role => userRoleValues.includes(role));
        if (!hasRole) return res.status(403).json({ message: "Rol yetarli emas" });
      }

      // --- 3. Permission tekshiruvi ---
      if (requiredPermissions.length > 0) {
        const hasPerm = requiredPermissions.every(p => userPermissionValues.includes(p));
        if (!hasPerm) return res.status(403).json({ message: "Huquq yetarli emas" });
      }

      next();
    } catch (error) {
      res.status(500).json({ message: "Auth Error", error: error.message });
    }
  };
};

module.exports = authorize;