// src/components/FeedbackWidget.jsx
import React, { useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';

const CLOUD_NAME = "dcadn2syh"; 
const UPLOAD_PRESET = "tuhocvui_feedback";   

const topics = ["Báo lỗi hệ thống", "Góp ý bài học/khoá học", "Giao diện & Trải nghiệm", "Khác"];
const ratings = [
    { score: 1, icon: "😡", label: "Rất tệ" },
    { score: 2, icon: "😟", label: "Tệ" },
    { score: 3, icon: "😐", label: "Bình thường" },
    { score: 4, icon: "🙂", label: "Tốt" },
    { score: 5, icon: "😍", label: "Tuyệt vời" },
];

export const FeedbackWidget = () => {
    const location = useLocation();
    const [isOpen, setIsOpen] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    const [topic, setTopic] = useState("Góp ý bài học/khoá học");
    const [message, setMessage] = useState("");
    const [rating, setRating] = useState(5);
    const [email, setEmail] = useState("");
    const [selectedFile, setSelectedFile] = useState(null); 
    const [previewUrl, setPreviewUrl] = useState(null);     
    const [loading, setLoading] = useState(false);
    
    const fileInputRef = useRef(null);
    const token = localStorage.getItem('token') || localStorage.getItem('tuhocvui_token');
    
    if (location.pathname.includes('/admin')) return null;

    const handleImageSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) { 
            toast.warn("Vui lòng chỉ chọn file ảnh định dạng hợp lệ."); 
            return; 
        }
        if (file.size > 3 * 1024 * 1024) { 
            toast.error("Ảnh quá lớn! Vui lòng chọn ảnh dưới 3MB."); 
            return; 
        }
        setSelectedFile(file);
        setPreviewUrl(URL.createObjectURL(file));
    };

    const removeImage = () => {
        setSelectedFile(null);
        setPreviewUrl(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const uploadToCloudinary = async (file) => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", UPLOAD_PRESET);
        try {
            const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, { method: "POST", body: formData });
            const data = await res.json();
            return data.secure_url;
        } catch (error) { throw new Error("Lỗi tải ảnh lên hệ thống"); }
    };

    const handleSubmit = async () => {
        if (!message.trim()) {
            toast.warn("Vui lòng điền nội dung chi tiết phản hồi!");
            return;
        }
        setLoading(true);
        try {
            let imageUrl = null;
            if (selectedFile) imageUrl = await uploadToCloudinary(selectedFile);

            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            
            const response = await fetch(`${API_URL}/api/feedback`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json', 
                    'x-auth-token': token || '',
                    'Authorization': token ? `Bearer ${token}` : ''
                },
                body: JSON.stringify({ topic, message, rating, email, image: imageUrl })
            });
            
            const data = await response.json();
            if (!response.ok) throw new Error(data.message);

            toast.success("Cảm ơn bạn đã đóng góp ý kiến cho Tự Học Vui!");
            setIsOpen(false);
            setMessage("");
            setEmail("");
            setRating(5);
            removeImage();
        } catch (error) { 
            toast.error(error.message || "Gửi phản hồi thất bại."); 
        } finally { 
            setLoading(false); 
        }
    };

    return (
        <>
            <div 
                style={{ position: 'fixed', bottom: '30px', right: '30px', zIndex: 9998, display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'end' }}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                <button
                    onClick={() => setIsOpen(true)}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#2563EB', color: 'white', padding: '10px 16px', borderRadius: '30px', boxShadow: '0 4px 15px rgba(37, 99, 235, 0.3)', border: 'none', cursor: 'pointer', fontWeight: '600', transition: 'all 0.3s ease', width: isHovered ? '120px' : '54px', height: '54px', overflow: 'hidden', whiteSpace: 'nowrap', justifyContent: isHovered ? 'flex-start' : 'center' }}
                >
                    <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>reviews</span>
                    {isHovered && <span>Góp ý</span>}
                </button>

                <button
                    onClick={() => window.open('https://m.me/61590283695697', '_blank')} 
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#0A7CFF', color: 'white', padding: '10px 16px', borderRadius: '30px', boxShadow: '0 4px 15px rgba(10, 124, 255, 0.3)', border: 'none', cursor: 'pointer', fontWeight: '600', transition: 'all 0.3s ease', width: isHovered ? '120px' : '54px', height: '54px', overflow: 'hidden', whiteSpace: 'nowrap', justifyContent: isHovered ? 'flex-start' : 'center' }}
                >
                    <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>forum</span>
                    {isHovered && <span>Chat ngay</span>}
                </button>
            </div>

            {isOpen && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 9999, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ backgroundColor: 'white', borderRadius: '16px', width: '90%', maxWidth: '500px', padding: '24px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px', justifyContent: 'space-between' }}>
                            <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#111827', margin: 0 }}>Góp ý & Báo lỗi sản phẩm</h3>
                            <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '24px', color: '#9CA3AF' }}>&times;</button>
                        </div>

                        {!token && (
                          <div style={{ marginBottom: '16px' }}>
                              <p style={{ fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>Email liên hệ của bạn</p>
                              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Nhập email để nhận phản hồi từ giáo viên..." style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #D1D5DB', fontSize: '13px', outline: 'none' }} />
                          </div>
                        )}

                        <div style={{ marginBottom: '16px' }}>
                            <p style={{ fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>Chủ đề *</p>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                {topics.map(t => (
                                    <button key={t} onClick={() => setTopic(t)} style={{ padding: '6px 12px', borderRadius: '20px', fontSize: '12px', border: topic === t ? '1px solid #2563EB' : '1px solid #E5E7EB', backgroundColor: topic === t ? '#EFF6FF' : 'white', color: topic === t ? '#2563EB' : '#374151', cursor: 'pointer', fontWeight: '500' }}>{t}</button>
                                ))}
                            </div>
                        </div>

                        <div style={{ marginBottom: '16px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                <p style={{ fontSize: '13px', fontWeight: '600', color: '#374151', margin: 0 }}>Chi tiết phản hồi *</p>
                                <button onClick={() => fileInputRef.current.click()} style={{ border: 'none', background: 'none', color: '#2563EB', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '2px' }}>
                                    <span className="material-symbols-outlined" style={{fontSize: '16px'}}>add_photo_alternate</span> Thêm ảnh minh họa
                                </button>
                                <input type="file" ref={fileInputRef} onChange={handleImageSelect} accept="image/*" style={{ display: 'none' }} />
                            </div>
                            <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Mô tả chi tiết bài học bị lỗi hoặc giao diện..." style={{ width: '100%', height: '90px', padding: '12px', borderRadius: '8px', border: '1px solid #D1D5DB', fontSize: '13px', outline: 'none', resize: 'none' }} />
                            {previewUrl && (
                                <div style={{ marginTop: '8px', position: 'relative', width: 'fit-content' }}>
                                    <img src={previewUrl} alt="Preview" style={{ height: '70px', borderRadius: '6px', objectFit: 'cover' }} />
                                    <button onClick={removeImage} style={{ position: 'absolute', top: '-6px', right: '-6px', background: '#EF4444', color: 'white', border: 'none', borderRadius: '50%', width: '18px', height: '18px', cursor: 'pointer', fontSize: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>&times;</button>
                                </div>
                            )}
                        </div>

                        <div style={{ marginBottom: '20px', textAlign: 'center' }}>
                            <p style={{ fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>Mức độ hài lòng</p>
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 20px' }}>
                                {ratings.map(r => (
                                    <div key={r.score} onClick={() => setRating(r.score)} style={{ cursor: 'pointer', opacity: rating === r.score ? 1 : 0.4, transform: rating === r.score ? 'scale(1.12)' : 'scale(1)', transition: 'all 0.2s' }}>
                                        <div style={{ fontSize: '28px' }}>{r.icon}</div>
                                        <div style={{ fontSize: '10px', marginTop: '2px', color: '#4B5563' }}>{r.label}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '12px' }}>
                          <button onClick={() => setIsOpen(false)} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #D1D5DB', backgroundColor: 'white', color: '#374151', fontWeight: '600', cursor: 'pointer', fontSize: '13px' }}>Hủy</button>
                          <button onClick={handleSubmit} disabled={loading} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', backgroundColor: '#10B981', color: 'white', fontWeight: '600', cursor: 'pointer', opacity: loading ? 0.7 : 1, fontSize: '13px' }}>
                              {loading ? 'Đang gửi...' : 'Gửi hệ thống'}
                          </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};