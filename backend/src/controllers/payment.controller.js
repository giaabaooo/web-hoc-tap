// controllers/payment.controller.js
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

import { Order } from '../models/Order.js';
import { Package } from '../models/Package.js';
import { UserPackage } from '../models/UserPackage.js';
import { Course } from '../models/Course.js';         
import { Enrollment } from '../models/Enrollment.js'; 

let payosInstance = null;

const getPayOS = () => {
  if (payosInstance) return payosInstance;

  const clientId = process.env.PAYOS_CLIENT_ID;
  const apiKey = process.env.PAYOS_API_KEY;
  const checksumKey = process.env.PAYOS_CHECKSUM_KEY;

  if (!clientId || !apiKey || !checksumKey) {
    console.error("❌ LỖI: Không tìm thấy Key PayOS trong file .env!");
  }

  let PayOSModule;
  try {
    PayOSModule = require('@payos/node');
  } catch (e) {
    throw new Error("Thư viện @payos/node chưa được cài đặt.");
  }

  const candidates = [ PayOSModule, PayOSModule?.default, PayOSModule?.PayOS, PayOSModule?.default?.default, PayOSModule?.default?.PayOS ];

  for (const Candidate of candidates) {
    if (typeof Candidate === 'function') {
      try {
        const instance = new Candidate(clientId, apiKey, checksumKey);
        if (instance && typeof instance.createPaymentLink === 'function') {
          payosInstance = instance;
          return payosInstance;
        }
      } catch (err) {}
    }
  }
  throw new Error("🚨 PHIÊN BẢN KHÔNG TƯƠNG THÍCH! Hãy chạy lệnh: npm install @payos/node@1.0.10");
};


// ==========================================
// 1. API Tạo mã QR thanh toán (HỖ TRỢ GIỎ HÀNG NHIỀU ITEM)
export const createPaymentLink = async (req, res) => {
  try {
    const payos = getPayOS(); 
    
    // Nhận mảng itemIds từ giỏ hàng Frontend
    const { itemIds } = req.body; 
    const userId = req.user._id;

    if (!itemIds || itemIds.length === 0) {
      return res.status(400).json({ message: 'Giỏ hàng đang trống!' });
    }

    // 1. Quét DB lấy toàn bộ sản phẩm (Cả Combo lẫn Khóa lẻ)
    const foundPackages = await Package.find({ _id: { $in: itemIds } });
    const foundCourses = await Course.find({ _id: { $in: itemIds } });
    const allItems = [...foundPackages, ...foundCourses];

    if (allItems.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy sản phẩm hợp lệ nào!' });
    }

    // 2. Tính tổng tiền
    const totalAmount = allItems.reduce((sum, item) => sum + item.price, 0);

    const orderCode = Number(String(Date.now()).slice(-5) + Math.floor(1000 + Math.random() * 9000));
    const domain = process.env.CLIENT_URL || 'http://localhost:5173';

    // 3. Lưu đơn hàng chứa NHIỀU items
    await Order.create({
      orderCode,
      user: userId,
      items: allItems.map(item => item._id.toString()), // Lưu mảng ID
      amount: totalAmount
    });

    // 4. Cấu hình mảng Items gửi cho PayOS hiển thị trên App Ngân Hàng
    const payosItems = allItems.map(item => ({
      name: item.title.substring(0, 25), // PayOS giới hạn ký tự tên sản phẩm
      quantity: 1,
      price: item.price
    }));

    const body = {
      orderCode,
      amount: totalAmount,
      description: `Thanh toan ${orderCode}`,
      cancelUrl: `${domain}/pricing`,
      returnUrl: `${domain}/pricing`,
      items: payosItems
    };

    const paymentLinkRes = await payos.createPaymentLink(body);
    res.json({ checkoutUrl: paymentLinkRes.checkoutUrl, qrCode: paymentLinkRes.qrCode, orderCode });

  } catch (error) {
    console.error("❌ LỖI TẠO THANH TOÁN PAYOS:", error); 
    res.status(500).json({ message: error.message || 'Lỗi hệ thống khi tạo thanh toán PayOS', details: error });
  }
};

// ==========================================
// 2. API Nhận Webhook từ PayOS để mở khóa nội dung
export const payosWebhook = async (req, res) => {
  try {
    const payos = getPayOS(); 
    const webhookData = payos.verifyPaymentWebhookData(req.body);

    if (webhookData.code === '00' && webhookData.data.status === 'PAID') {
      const orderCode = webhookData.data.orderCode;
      
      const order = await Order.findOne({ orderCode });
      if (!order || order.status === 'PAID') return res.json({ success: true });

      order.status = 'PAID';
      await order.save();

      const now = new Date();

      // KIỂM TRA & MỞ KHÓA CHO TỪNG SẢN PHẨM TRONG GIỎ HÀNG
      for (const itemId of order.items) {
        
        // Cấp quyền nếu là Combo
        const isPackage = await Package.findById(itemId);
        if (isPackage) {
          const durationMs = (isPackage.durationDays || 365) * 24 * 60 * 60 * 1000;
          let userPkg = await UserPackage.findOne({ user: order.user, package: isPackage._id });

          if (userPkg) {
            userPkg.expireAt = userPkg.expireAt > now ? new Date(userPkg.expireAt.getTime() + durationMs) : new Date(now.getTime() + durationMs);
            await userPkg.save();
          } else {
            await UserPackage.create({ user: order.user, package: isPackage._id, expireAt: new Date(now.getTime() + durationMs) });
          }
          continue; // Xong món này thì bỏ qua vòng lặp tiếp
        } 
        
        // Cấp quyền nếu là Khóa lẻ
        const isCourse = await Course.findById(itemId);
        if (isCourse) {
          let enrollment = await Enrollment.findOne({ student: order.user, course: isCourse._id });
          if (!enrollment) {
            await Enrollment.create({ student: order.user, course: isCourse._id });
          }
        }
      }
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Webhook Error:', error);
    res.status(400).json({ success: false });
  }
};

// ==========================================
export const checkPaymentStatus = async (req, res) => {
  try {
    const { orderCode } = req.params;
    const order = await Order.findOne({ orderCode });
    if (!order) return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
    res.json({ status: order.status });
  } catch (error) { res.status(500).json({ message: 'Lỗi kiểm tra trạng thái', error }); }
};

export const getPublicPackages = async (req, res) => {
  try {
    const packages = await Package.find().populate('courses', 'title');
    res.json(packages);
  } catch (error) { res.status(500).json({ message: "Lỗi tải danh sách gói học" }); }
};

export const getMyPurchaseHistory = async (req, res) => {
  try {
    // Để an toàn, chỉ hiển thị lịch sử đơn giản, không populate vì mảng items chứa ID trộn lẫn
    const orders = await Order.find({ user: req.user._id, status: 'PAID' })
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) { res.status(500).json({ message: "Lỗi tải lịch sử mua hàng" }); }
};