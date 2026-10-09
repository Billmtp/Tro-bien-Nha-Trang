"use client";

import { useEffect, useRef, useState } from "react";

const CHARS = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ"; // exclude 0, 1, I, O to prevent confusion

export default function CaptchaVerification({
  onVerify,
  required = true,
}: {
  onVerify: (isValid: boolean) => void;
  required?: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [captchaCode, setCaptchaCode] = useState("");
  const [userInput, setUserInput] = useState("");
  const [isMatch, setIsMatch] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  // Sinh mã Captcha ngẫu nhiên
  const generateCode = () => {
    let code = "";
    for (let i = 0; i < 5; i++) {
      code += CHARS.charAt(Math.floor(Math.random() * CHARS.length));
    }
    setCaptchaCode(code);
    setUserInput("");
    setIsMatch(false);
    onVerify(false);
    return code;
  };

  // Vẽ Captcha lên Canvas kèm đường nhiễu & chấm nhiễu chống OCR bot
  const drawCaptcha = (code: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Nền gradient ngẫu nhiên nhẹ
    const grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, "#F3F4F6");
    grad.addColorStop(1, "#E5E7EB");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Vẽ 4-6 đường nhiễu ngẫu nhiên
    for (let i = 0; i < 5; i++) {
      ctx.strokeStyle = `rgba(${Math.floor(Math.random() * 150)}, ${Math.floor(Math.random() * 150)}, ${Math.floor(Math.random() * 150)}, 0.4)`;
      ctx.lineWidth = 1 + Math.random() * 2;
      ctx.beginPath();
      ctx.moveTo(Math.random() * width, Math.random() * height);
      ctx.bezierCurveTo(
        Math.random() * width, Math.random() * height,
        Math.random() * width, Math.random() * height,
        Math.random() * width, Math.random() * height
      );
      ctx.stroke();
    }

    // Vẽ 35-50 chấm nhiễu
    for (let i = 0; i < 40; i++) {
      ctx.fillStyle = `rgba(${Math.floor(Math.random() * 200)}, ${Math.floor(Math.random() * 200)}, ${Math.floor(Math.random() * 200)}, 0.5)`;
      ctx.beginPath();
      ctx.arc(Math.random() * width, Math.random() * height, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Vẽ từng ký tự xoay nghiêng
    const charList = code.split("");
    const charSpacing = width / (charList.length + 1);

    charList.forEach((char, index) => {
      ctx.save();
      const x = charSpacing * (index + 0.8);
      const y = height / 2 + (Math.random() * 8 - 4);
      const angle = (Math.random() * 40 - 20) * (Math.PI / 180);

      ctx.translate(x, y);
      ctx.rotate(angle);

      ctx.font = `bold ${22 + Math.floor(Math.random() * 6)}px monospace`;
      // Màu chữ tương phản đậm
      const colors = ["#1F2937", "#9A3412", "#1E40AF", "#065F46", "#3730A3", "#991B1B"];
      ctx.fillStyle = colors[index % colors.length];
      ctx.textBaseline = "middle";
      ctx.textAlign = "center";
      ctx.fillText(char, 0, 0);

      ctx.restore();
    });
  };

  useEffect(() => {
    const code = generateCode();
    drawCaptcha(code);
  }, []);

  useEffect(() => {
    if (captchaCode) {
      drawCaptcha(captchaCode);
    }
  }, [captchaCode]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toUpperCase();
    setUserInput(val);
    setHasInteracted(true);

    const match = val.trim() === captchaCode;
    setIsMatch(match);
    onVerify(match);
  };

  // Đọc âm thanh mã Captcha
  const speakCaptcha = () => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const textToSpeak = captchaCode.split("").join(" ");
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.rate = 0.75;
      utterance.lang = "vi-VN";
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
          <span>🛡️</span>
          <span>Xác thực chống Spam (Mã Captcha)</span>
          {required && <span className="text-red-500">*</span>}
        </label>
        {isMatch && (
          <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1 animate-in fade-in">
            <span>✓</span> Đã xác thực
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        {/* Khung Canvas hiển thị Captcha */}
        <div className="relative border border-gray-300 rounded-lg overflow-hidden shadow-inner bg-gray-100 shrink-0">
          <canvas
            ref={canvasRef}
            width={140}
            height={42}
            className="block select-none"
            title="Mã kiểm tra bảo mật"
          />
        </div>

        {/* Nút đổi mã & nghe âm thanh */}
        <div className="flex flex-col gap-1 shrink-0">
          <button
            type="button"
            onClick={() => {
              const code = generateCode();
              drawCaptcha(code);
            }}
            title="Đổi mã khác"
            className="p-1 text-gray-500 hover:text-gray-800 bg-white hover:bg-gray-200 border border-gray-200 rounded text-xs font-bold transition-colors"
          >
            🔄
          </button>
          <button
            type="button"
            onClick={speakCaptcha}
            title="Đọc to mã Captcha"
            className="p-1 text-gray-500 hover:text-gray-800 bg-white hover:bg-gray-200 border border-gray-200 rounded text-xs font-bold transition-colors"
          >
            🔊
          </button>
        </div>

        {/* Ô nhập mã xác nhận */}
        <div className="flex-1 min-w-0">
          <input
            type="text"
            maxLength={5}
            placeholder="Nhập 5 ký tự..."
            value={userInput}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 text-xs sm:text-sm font-mono font-bold tracking-widest text-center uppercase rounded-lg border outline-none transition-all ${
              isMatch
                ? "border-emerald-500 bg-emerald-50/50 text-emerald-800 ring-1 ring-emerald-500"
                : hasInteracted && userInput.length >= 5
                ? "border-red-400 bg-red-50 text-red-700"
                : "border-gray-300 bg-white focus:border-[#FF7A00] focus:ring-1 focus:ring-[#FF7A00]"
            }`}
          />
        </div>
      </div>

      {hasInteracted && !isMatch && userInput.length >= 5 && (
        <p className="text-[11px] text-red-500 font-medium">
          Mã xác nhận chưa chính xác, vui lòng nhập lại hoặc bấm 🔄 đổi mã.
        </p>
      )}
    </div>
  );
}
