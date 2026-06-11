import React from 'react';

export const Faq = () => {
  const faqList = [
    "Làm thế nào để đăng ký tài khoản?",
    "Làm thế nào để mua khóa học?",
    "Tôi có thể thanh toán bằng những phương thức nào?",
    "Học phí 10k/tháng/ngôn ngữ có cần phải đóng thêm phí gì khác không?"
  ];

  return (
    <div className="min-h-screen bg-[#f4f7fe] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-extrabold text-[#1a2b4c] text-center mb-10">
          Câu hỏi thường gặp (FAQ)
        </h2>
        
        <div className="space-y-4">
          {faqList.map((question, index) => (
            <div 
              key={index} 
              className="bg-white rounded-xl shadow-sm border border-blue-50 p-6 hover:shadow-md transition-shadow cursor-pointer flex justify-between items-center"
            >
              <h3 className="text-lg font-bold text-[#1b4ed8]">
                {question}
              </h3>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};