'use client';
import Image from 'next/image';
import habbit from '@/assets/habbit.png'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-green-50 to-teal-100 flex items-center justify-center p-6 font-sans relative overflow-hidden">
      
      {/* (Radial Gradient) */}
      <div className="absolute inset-0 bg-[radial-gradient(#0f766e_1.5px,transparent_1.5px)] [background-size:24px_24px] opacity-20"></div>
      
      {/* Blobs) */}
      <div className="absolute top-0 -left-4 w-96 h-96 bg-yellow-300 rounsded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
      <div className="absolute top-0 -right-4 w-96 h-96 bg-cyan-300 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-32 left-20 w-96 h-96 bg-green-300 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-4000"></div>
      <div className="absolute bottom-40 right-10 w-80 h-80 bg-orange-200 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-1000"></div>

      {/* Main Card */}
      <div className="w-full max-w-6xl bg-white/50 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/60 p-10 relative z-10">
      
        {/* NAVBAR */}
        <nav className="flex flex-wrap justify-end items-center space-x-6 text-sm font-bold text-gray-700 mb-12">
          <a href="/about" className="hover:text-green-800 transition-colors relative group py-1">
            About Us
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-green-600 transition-all group-hover:w-full"></span>
          </a>
          
          <a href="/login" className="px-6 py-2.5 rounded-xl border-2 border-gray-800 text-gray-800 font-bold hover:bg-gray-800 hover:text-white transition-all duration-300 shadow-sm hover:shadow-lg hover:-translate-y-0.5">
            Log In
          </a>
          
          <a href="/singup" className="px-6 py-2.5 bg-gray-900 text-white rounded-xl shadow-lg hover:bg-black hover:shadow-xl hover:shadow-gray-900/30 hover:-translate-y-0.5 transition-all duration-300">
            Sign Up
          </a>
        </nav>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
                    {/* TEXT CONTENT */}
          <div className="flex flex-col justify-center space-y-6">
            <h1 className="text-5xl md:text-6xl font-extrabold text-white leading-tight drop-shadow-sm">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-teal-600 ">Habbit</span> <br /> 
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-900 to-teal-800">
                Tracker App
              </span>
            </h1>
            
            <p className="text-gray-700 text-lg leading-relaxed font-medium">
              Habit Tracker หรือ <span className="font-bold text-green-800">`แอปติดตามนิสัย`</span> คือเครื่องมือดิจิทัลที่ปฏิวัติวิธีการสร้างและรักษานิสัยที่ดีในชีวิตประจำวันของผู้คน มันเปลี่ยนการตั้งเป้าหมายที่ดูเป็นนามธรรมให้กลายเป็นการกระทำที่เป็นรูปธรรมและสามารถติดตามผลได้จริง ไม่ว่าจะเป็นการออกกำลังกาย การดื่มน้ำ การนั่งสมาธิ หรือการเรียนรู้ทักษะใหม่ ๆ
            </p>

          </div>

          {/* ILLUSTRATION (replace with your image) */}
          <div className="flex items-center justify-center">
            <div className="w-72 h-72 bg-white/30 rounded-2xl flex items-center justify-center">
              <Image src={habbit} alt="habbit logo" />
            </div>
          </div>

      </div>
      </div>
    </div>
  );
}