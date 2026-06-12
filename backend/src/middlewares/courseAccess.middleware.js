// middlewares/courseAccess.middleware.js
import { UserPackage } from '../models/UserPackage.js';

export const checkPackageAccess = async (req, res, next) => {
  try {
    const userId = req.user._id; // Từ protect middleware
    const packageId = req.params.packageId; // Lấy từ URL

    const access = await UserPackage.findOne({
      user: userId,
      package: packageId,
      expireAt: { $gt: new Date() } // Điều kiện: Ngày hết hạn phải LỚN HƠN thời gian hiện tại
    });

    if (!access) {
      return res.status(403).json({ message: 'Bạn chưa sở hữu hoặc gói đã hết hạn. Vui lòng thanh toán!' });
    }

    next(); // Hợp lệ -> Cho phép xem nội dung
  } catch (error) {
    res.status(500).json({ message: 'Lỗi xác thực quyền hạn' });
  }
};