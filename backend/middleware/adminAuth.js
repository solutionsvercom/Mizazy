import jwt from "jsonwebtoken";
import Admin from "../models/Admin.js";

const secret = () => process.env.JWT_SECRET || "mizazy-dev-secret-change-in-production";

export function signAdminToken(adminId) {
  return jwt.sign({ aid: String(adminId), role: "admin" }, secret(), { expiresIn: "12h" });
}

export async function requireAdmin(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token) return res.status(401).json({ message: "Admin sign-in required" });

    const decoded = jwt.verify(token, secret());
    if (decoded.role !== "admin" || !decoded.aid) return res.status(401).json({ message: "Admin sign-in required" });

    const admin = await Admin.findById(decoded.aid);
    if (!admin) return res.status(401).json({ message: "Admin account not found" });
    // Changing the password signs out every session that was issued before the change.
    if (admin.passwordChangedAt && decoded.iat * 1000 < admin.passwordChangedAt.getTime() - 1000) {
      return res.status(401).json({ message: "Password was changed. Please sign in again." });
    }

    req.admin = admin;
    next();
  } catch {
    return res.status(401).json({ message: "Admin session expired. Please sign in again." });
  }
}
