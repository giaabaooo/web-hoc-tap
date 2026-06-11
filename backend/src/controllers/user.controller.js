import { User } from '../models/User.js';

export const updateProfile = async (req, res) => {
  try {
    const { displayName, avatar } = req.body;
    
    // Không cho phép đổi Email và Role qua API này
    const user = await User.findByIdAndUpdate(
      req.user._id, 
      { displayName, avatar }, 
      { new: true, runValidators: true }
    ).select('-password'); // Không trả về mật khẩu

    res.json({ message: "Cập nhật thành công", user });
  } catch (error) {
    res.status(500).json({ message: "Lỗi hệ thống khi cập nhật hồ sơ" });
  }
};