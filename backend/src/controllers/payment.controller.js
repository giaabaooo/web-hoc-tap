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
// 1. API Tạo mã QR thanh toán (HỖ TRỢ GIỎ HÀNG NHIỀU MÓN)
export const createPaymentLink = async (req, res) => {
  try {
    const payos = getPayOS(); 
    const { itemIds } = req.body; 
    const userId = req.user._id;

    if (!itemIds || itemIds.length === 0) return res.status(400).json({ message: 'Giỏ hàng đang trống!' });

    const foundPackages = await Package.find({ _id: { $in: itemIds } });
    const foundCourses = await Course.find({ _id: { $in: itemIds } });
    const allItems = [...foundPackages, ...foundCourses];

    if (allItems.length === 0) return res.status(404).json({ message: 'Không tìm thấy sản phẩm!' });

    const totalAmount = allItems.reduce((sum, item) => sum + item.price, 0);
    const orderCode = Number(String(Date.now()).slice(-5) + Math.floor(1000 + Math.random() * 9000));
    const domain = process.env.CLIENT_URL || 'http://localhost:5173';

    await Order.create({
      orderCode,
      user: userId,
      items: allItems.map(item => item._id.toString()),
      amount: totalAmount
    });

    const body = {
      orderCode,
      amount: totalAmount,
      description: `Thanh toan ${orderCode}`,
      cancelUrl: `${domain}/pricing`,
      returnUrl: `${domain}/pricing`,
      items: allItems.map(item => ({ name: item.title.substring(0, 25), quantity: 1, price: item.price }))
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

      // Cập nhật trạng thái trước để tránh Race Condition (Chạy đè 2 lần)
      order.status = 'PAID';
      await order.save();

      const now = new Date();

      // MỞ KHÓA CHO TỪNG SẢN PHẨM TRONG GIỎ HÀNG
      for (const itemId of order.items) {
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
          continue; 
        } 
        
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
  } catch (error) { res.status(400).json({ success: false }); }
};

// ==========================================
// 3. API KIỂM TRA TRẠNG THÁI (ĐÃ FIX LỖI LOCALHOST WEBHOOK)
export const checkPaymentStatus = async (req, res) => {
  try {
    const { orderCode } = req.params;
    const order = await Order.findOne({ orderCode });
    if (!order) return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });

    // Nếu DB đã ghi nhận thành công
    if (order.status === 'PAID') return res.json({ status: 'PAID' });

    // FALLBACK THÔNG MINH DÀNH RIÊNG CHO LOCALHOST: Chủ động gọi API check trạng thái từ PayOS
    try {
      const payos = getPayOS();
      const paymentInfo = await payos.getPaymentLinkInformation(orderCode);
      
      // Nếu PayOS xác nhận đã nhận tiền nhưng Webhook chưa kịp kích hoạt (do localhost)
      if (paymentInfo.status === 'PAID' || paymentInfo.status === 'Thành công') {
        order.status = 'PAID';
        await order.save();

        const now = new Date();
        for (const itemId of order.items) {
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
            continue; 
          } 
          const isCourse = await Course.findById(itemId);
          if (isCourse) {
            let enrollment = await Enrollment.findOne({ student: order.user, course: isCourse._id });
            if (!enrollment) await Enrollment.create({ student: order.user, course: isCourse._id });
          }
        }
        return res.json({ status: 'PAID' }); // Báo Frontend đóng cửa sổ ngay
      }
    } catch (payosErr) {
      // Bỏ qua lỗi ngầm nếu PayOS link chưa tồn tại
    }

    res.json({ status: order.status });
  } catch (error) { res.status(500).json({ message: 'Lỗi kiểm tra trạng thái', error }); }
};

export const getPublicPackages = async (req, res) => {
  try {
    const packages = await Package.find().populate('courses', 'title');
    res.json(packages);
  } catch (error) { res.status(500).json({ message: "Lỗi tải danh sách gói học" }); }
};

// 4. LẤY LỊCH SỬ VÀ PHỤC HỒI TÊN SẢN PHẨM TRONG GIỎ
export const getMyPurchaseHistory = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id, status: 'PAID' }).sort({ createdAt: -1 });

    // Dịch ngược mảng ID thành tên Sản phẩm hiển thị cho đẹp
    const historyWithDetails = await Promise.all(orders.map(async (order) => {
      let itemNames = [];
      for (const itemId of order.items) {
        let pkg = await Package.findById(itemId);
        if (pkg) itemNames.push(`[Combo] ${pkg.title}`);
        else {
          let crs = await Course.findById(itemId);
          if (crs) itemNames.push(`[Khóa lẻ] ${crs.title}`);
        }
      }
      return {
        ...order.toObject(),
        itemNames: itemNames.length > 0 ? itemNames.join(', ') : 'Sản phẩm đã xóa'
      };
    }));

    res.json(historyWithDetails);
  } catch (error) { res.status(500).json({ message: "Lỗi tải lịch sử mua hàng" }); }
};