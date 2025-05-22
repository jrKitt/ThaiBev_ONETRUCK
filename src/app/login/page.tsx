'use client';
import React, { useState } from "react";
import { Icon } from "@iconify/react";
import Image from "next/image";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [employee, setEmployee] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (employee === "ONELOG0001" && password === "12345678") {
        toast.success("เข้าสู่ระบบสำเร็จ");
        setTimeout(() => (window.location.href = "/region"), 2000);
      } else {
        toast.error("รหัสพนักงานหรือรหัสผ่านไม่ถูกต้อง");
      }
    } catch {
      toast.error("เกิดข้อผิดพลาดในการเข้าสู่ระบบ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* ฝั่งซ้าย: คงขนาดครึ่งจอ ใช้ bg cover เต็มฝั่งซ้าย */}
      <div
        className="
          hidden md:flex 
          w-1/2 h-screen
          bg-[url('/bg.png')] bg-cover bg-center bg-[#F7FCFD]
        "
      />
       

      <div className="w-full md:w-1/2 flex flex-col justify-center items-center p-8 bg-gray-50 relative">
        <div className="absolute top-8 right-8">
          <Image
            src="/logo.png"
            alt="One Logistics"
            width={128}
            height={128}
          />
        </div>

        {/* ฟอร์มเข้าสู่ระบบ */}
        <form
          onSubmit={handleLogin}
          className="w-full max-w-md space-y-6"
        >
          <img src="/logo58-removebg-preview.png" className="text-[64px] font-semibold text-center text-[#1049CD]"/>

          <h2 className="text-2xl font-semibold text-center text-black">เข้าสู่ระบบ</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              รหัสพนักงาน <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="กรอกรหัสพนักงาน"
              className="mt-1 block w-full rounded-md border border-gray-300 p-3 placeholder-gray-400 text-black
                         focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
              value={employee}
              onChange={(e) => setEmployee(e.target.value)}
              required
            />
          </div>

          <div className="relative">
            <label className="block text-sm font-medium text-gray-700">
              รหัสผ่าน <span className="text-red-500">*</span>
            </label>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="กรอกรหัสผ่าน"
              className="mt-1 block w-full rounded-md border border-gray-300 p-3 pr-10 placeholder-gray-400 text-black
                         focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700 focus:outline-none"
              aria-label="Toggle password visibility"
            >
              <Icon
                icon={showPassword ? "mdi:eye-off" : "mdi:eye"}
                width="24"
              />
            </button>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              className="h-5 w-5 text-blue-600 rounded border-gray-300"
            />
            <span className="ml-2 text-sm text-gray-700">
              ฉันเห็นด้วยกับ{" "}
              <a href="#" className="text-blue-600 hover:underline">
                ข้อกำหนด
              </a>{" "}
              และ{" "}
              <a href="#" className="text-blue-600 hover:underline">
                นโยบายความเป็นส่วนตัว
              </a>
            </span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-md font-semibold text-white transition-colors
              ${loading ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}`}
          >
            {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
          </button>

          <p className="text-center text-gray-600">
            ยังไม่มีบัญชี?{" "}
            <a href="/auth/register" className="text-blue-600 hover:underline">
              ลงทะเบียน
            </a>
          </p>
        </form>

        {/* Toast */}
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="colored"
        />
      </div>
    </div>
  );
}
