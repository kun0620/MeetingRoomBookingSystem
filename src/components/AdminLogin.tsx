import React, { useState } from 'react';
import { Lock, ArrowLeft, Loader2 } from 'lucide-react';

interface AdminLoginProps {
  onLogin: (code: string) => Promise<boolean>; // Changed to accept only code
  loading?: boolean;
  error?: string | null;
  onBackToMain: () => void;
}

export default function AdminLogin({ onLogin, loading = false, error, onBackToMain }: AdminLoginProps) {
  const [departmentCode, setDepartmentCode] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      await onLogin(departmentCode);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg relative">
        {/* Back Button */}
        <button
          onClick={onBackToMain}
          className="absolute top-4 left-4 p-2 rounded-full text-gray-600 hover:bg-gray-100 hover:text-blue-600 transition-colors"
          title="กลับสู่หน้าหลัก"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>

        <div className="text-center">
          <Lock className="mx-auto h-12 w-12 text-blue-500" />
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            เข้าสู่ระบบแอดมิน
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            กรุณาป้อนรหัสประจำแผนกเพื่อเข้าสู่ระบบ
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="department-code" className="block text-sm font-medium text-gray-700 mb-2">
                รหัสประจำแผนก
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="department-code"
                  name="department-code"
                  type="text"
                  required
                  value={departmentCode}
                  onChange={(e) => setDepartmentCode(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="ป้อนรหัสแผนกของคุณ"
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-blue-800 text-sm">
              <strong>สำหรับผู้ดูแลระบบ:</strong><br />
              1. สร้างรหัสแผนกใหม่ในตาราง `public.department_codes` ใน Supabase Studio<br />
              2. กำหนด `role` ของรหัสแผนกนั้นเป็น 'admin'
            </p>
          </div>

          <button
            type="submit"
            disabled={submitting || loading}
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting || loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                กำลังเข้าสู่ระบบ...
              </>
            ) : (
              'เข้าสู่ระบบ'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
