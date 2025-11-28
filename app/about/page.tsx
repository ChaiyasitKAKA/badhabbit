'use client';

import React from 'react';
import { Target, Heart, Eye, Shield, Brain, ArrowRight } from 'lucide-react';
import Link from 'next/link';


export default function AboutUs() {
  return (
    <div className="min-h-screen bg-linear-to-br from-yellow-50 via-green-50 to-teal-100 flex flex-col items-center justify-center p-4 md:p-6 font-sans relative overflow-y-auto">
      
      {/* Background Decorations */}
      <div className="absolute inset-0 bg-[radial-gradient(#0f766e_1.5px,transparent_1.5px)] bg-size-[24px_24px] opacity-20 pointer-events-none"></div>
      
      {/* Animated Blobs */}
      <div className="absolute top-0 -left-4 w-96 h-96 bg-yellow-300 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob pointer-events-none"></div>
      <div className="absolute top-0 -right-4 w-96 h-96 bg-cyan-300 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000 pointer-events-none"></div>
      <div className="absolute -bottom-32 left-20 w-96 h-96 bg-green-300 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-4000 pointer-events-none"></div>
      <div className="absolute bottom-40 right-10 w-80 h-80 bg-orange-200 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-1000 pointer-events-none"></div>

      {/* Main Content Card */}
      <div className="w-full max-w-6xl bg-white/50 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/60 p-6 md:p-12 relative z-10 my-6">

        {/* NAVBAR */}
        <nav className="flex flex-wrap justify-between items-center mb-16">
        <Link href="/" className="text-2xl font-extrabold flex items-center gap-2 group hover:opacity-80 transition-opacity">
            <span className="text-transparent bg-clip-text bg-linear-to-r from-green-600 to-teal-600">
            Habbit
            </span>
        </Link>

        <div className="flex items-center space-x-2 md:space-x-6 text-sm font-bold text-gray-700">
            <Link href="/" className="hover:text-green-800 transition-colors relative group py-1">
                Home
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-green-600 transition-all group-hover:w-full"></span>
            </Link>

            <Link href="/about" className="text-green-800 transition-colors relative group py-1">
                About Us
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-green-600 transition-all"></span>
            </Link>
            
            <div className="hidden md:flex gap-3 ml-4">
                <Link 
                    href="/login" 
                    className="px-5 py-2 rounded-xl border-2 border-gray-800 text-gray-800 font-bold hover:bg-gray-800 hover:text-white transition-all duration-300 shadow-sm hover:shadow-lg hover:-translate-y-0.5"
                >
                    Log In
                </Link>

                <Link 
                    href="/singup" 
                    className="px-5 py-2 bg-gray-900 text-white rounded-xl shadow-lg hover:bg-black hover:shadow-xl hover:shadow-gray-900/30 hover:-translate-y-0.5 transition-all duration-300"
                >
                    Sign Up
                </Link>
            </div>
        </div>
    </nav>

        {/* HERO TITLE */}
        <div className="text-center space-y-6 max-w-4xl mx-auto mb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <span className="px-4 py-1.5 rounded-full bg-green-100 text-green-800 text-xs font-bold tracking-widest uppercase mb-4 inline-block shadow-sm">
                Our Story
            </span>
            <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 leading-tight">
            เปลี่ยนนิสัยเล็กๆ <br className="hidden md:block" /> ให้เป็น<span className="text-transparent bg-clip-text bg-linear-to-r from-green-600 to-teal-600">ความสำเร็จที่ยิ่งใหญ่</span>
            </h1>
            <p className="text-xl text-gray-600 font-medium max-w-2xl mx-auto leading-relaxed">
            วินัยสร้างได้ เริ่มต้นที่นี่... มารู้จักตัวตนและความตั้งใจของเรา
            </p>
        </div>

        {/* STORY SECTION */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch mb-20">
            <div className="bg-white/60 p-8 rounded-3xl border border-white/60 shadow-lg hover:shadow-xl transition-shadow duration-300 group">
                <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center mb-6 text-red-600 group-hover:scale-110 transition-transform">
                    <Target size={24} />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">ทำไมเราถึงล้มเลิกกลางคัน?</h3>
                <p className="text-gray-600 leading-relaxed text-lg">
                    เราเข้าใจดีว่าการสร้างนิสัยใหม่ๆ เป็นเรื่องยาก ปัญหาไม่ได้อยู่ที่ความตั้งใจของคุณ แต่อยู่ที่ <strong>ระบบ</strong> ที่น่าเบื่อ ขาดแรงกระตุ้น
                </p>
            </div>

            <div className="bg-linear-to-br from-green-50 to-teal-50 p-8 rounded-3xl border border-white/60 shadow-lg hover:shadow-xl transition-shadow duration-300 group">
                <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center mb-6 text-green-600 group-hover:scale-110 transition-transform">
                    <Heart size={24} />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">คำตอบของเราคือ Habbit</h3>
                <p className="text-gray-700 leading-relaxed text-lg">
                    เปลี่ยนเรื่องน่าเบื่อให้เป็นเรื่องสนุก ด้วยดีไซน์ที่สวยงามและระบบ <strong>Gamification</strong> เพื่อให้การเช็กชื่อนิสัยเป็นช่วงเวลาที่น่ารื่นรมย์
                </p>
            </div>
        </div>

        {/* MISSION & VISION */}
        <div className="relative overflow-hidden bg-gray-900 rounded-[2.5rem] p-10 md:p-16 text-white shadow-2xl mb-24">
            <div className="absolute top-0 right-0 w-80 h-80 bg-green-500 rounded-full mix-blend-overlay filter blur-3xl opacity-20 animate-pulse"></div>
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-teal-500 rounded-full mix-blend-overlay filter blur-3xl opacity-20 animate-pulse animation-delay-2000"></div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 relative z-10">
                <div>
                    <h4 className="text-green-400 font-bold uppercase tracking-wider mb-4 text-sm flex items-center gap-2">
                        <span className="w-8 h-0.5 bg-green-400 inline-block"></span> Our Mission
                    </h4>
                    <h3 className="text-3xl font-bold mb-6 leading-snug">สร้างเครื่องมือที่<br/>ใช้งานง่ายที่สุด</h3>
                    <p className="text-gray-300 font-light text-lg leading-relaxed">
                        เพื่อให้ทุกคนเข้าถึงการมีวินัยได้โดยไม่ต้องพยายามฝืน และทำให้การพัฒนาตัวเองเป็นเรื่องของความสุข
                    </p>
                </div>
                <div className="md:border-l md:border-gray-700 md:pl-12">
                    <h4 className="text-teal-400 font-bold uppercase tracking-wider mb-4 text-sm flex items-center gap-2">
                        <span className="w-8 h-0.5 bg-teal-400 inline-block"></span> Our Vision
                    </h4>
                    <h3 className="text-3xl font-bold mb-6 leading-snug">สังคมคุณภาพชีวิต<br/>ที่ดีขึ้น</h3>
                    <p className="text-gray-300 font-light text-lg leading-relaxed">
                        เห็นผู้คนมีความสุขและภูมิใจในตัวเอง ผ่านความสำเร็จเล็กๆ ที่สะสมจนยิ่งใหญ่
                    </p>
                </div>
            </div>
        </div>

        {/* WHY US */}
        <div className="mb-24">
            <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-extrabold text-gray-800 mb-4">ทำไมต้องเลือกเรา?</h2>
                <p className="text-xl text-gray-600">เราสร้าง พื้นที่ปลอดภัยสำหรับการเติบโตของคุณ</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white/60 p-8 rounded-3xl border border-white/50 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 text-center group">
                    <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-6 text-green-700 group-hover:scale-110 transition-transform duration-300 shadow-inner">
                        <Eye size={32} />
                    </div>
                    <h3 className="font-bold text-gray-800 text-xl mb-3">Design for Focus</h3>
                    <p className="text-gray-600 leading-relaxed">
                        อินเทอร์เฟซสะอาดตา ลดสิ่งรบกวน ช่วยให้คุณจดจ่อกับเป้าหมายได้ทันที
                    </p>
                </div>

                <div className="bg-white/60 p-8 rounded-3xl border border-white/50 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 text-center group">
                    <div className="w-16 h-16 bg-yellow-100 rounded-2xl flex items-center justify-center mx-auto mb-6 text-yellow-700 group-hover:scale-110 transition-transform duration-300 shadow-inner">
                        <Shield size={32} />
                    </div>
                    <h3 className="font-bold text-gray-800 text-xl mb-3">Privacy First</h3>
                    <p className="text-gray-600 leading-relaxed">
                        ข้อมูลของคุณเป็นความลับ 100% ไม่มีโฆษณารบกวนการใช้งาน
                    </p>
                </div>

                <div className="bg-white/60 p-8 rounded-3xl border border-white/50 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 text-center group">
                    <div className="w-16 h-16 bg-teal-100 rounded-2xl flex items-center justify-center mx-auto mb-6 text-teal-700 group-hover:scale-110 transition-transform duration-300 shadow-inner">
                        <Brain size={32} />
                    </div>
                    <h3 className="font-bold text-gray-800 text-xl mb-3">Psychology-Based</h3>
                    <p className="text-gray-600 leading-relaxed">
                        ออกแบบตามหลักจิตวิทยา สร้าง Loop ของนิสัยให้คุณทำต่อเนื่องได้โดยไม่ฝืน
                    </p>
                </div>
            </div>
        </div>

      </div>
    </div>
  );
}