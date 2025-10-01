import React, { useState, useEffect } from 'react';
import { useUsers } from '../../hooks/useUsers';
import { Users, Plus, CreditCard as Edit, Trash2, Mail, Phone, Loader2, Shield, User as UserIcon, ChevronDown } from 'lucide-react';
import { User, userSchema } from '../../types';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

type UserFormInputs = z.infer<typeof userSchema>;

export default function AdminUsers() {
  const { users, loading, createUser, updateUser, deleteUser } = useUsers();
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<UserFormInputs>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      email: '',
      name: '',
      phone: '',
      role: 'user',
      is_active: true
    }
  });

  useEffect(() => {
    if (editingUser) {
      setValue('email', editingUser.email);
      setValue('name', editingUser.name || '');
      setValue('phone', editingUser.phone || '');
      setValue('role', editingUser.role as 'admin' | 'user' || 'user');
      setValue('is_active', editingUser.is_active ?? true);
    } else {
      reset();
    }
  }, [editingUser, reset, setValue]);

  const handleAddUserClick = () => {
    setEditingUser(null);
    reset();
    setShowForm(true);
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setShowForm(true);
  };

  const onSubmit = async (data: UserFormInputs) => {
    setSubmitting(true);

    try {
      if (editingUser) {
        await updateUser(editingUser.id, data);
        alert('อัปเดตผู้ใช้สำเร็จ!');
      } else {
        await createUser(data);
        alert('เพิ่มผู้ใช้สำเร็จ!');
      }
      setShowForm(false);
      reset();
    } catch (error) {
      alert(`เกิดข้อผิดพลาด: ${error instanceof Error ? error.message : 'ไม่สามารถบันทึกข้อมูลได้'}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (userId: string, userName: string) => {
    if (confirm(`คุณต้องการปิดใช้งานผู้ใช้ "${userName}" หรือไม่?`)) {
      try {
        await deleteUser(userId);
        alert('ปิดใช้งานผู้ใช้สำเร็จ!');
      } catch (error) {
        alert(`เกิดข้อผิดพลาด: ${error instanceof Error ? error.message : 'ไม่สามารถปิดใช้งานผู้ใช้ได้'}`);
      }
    }
  };

  const activeUsers = users.filter(user => user.is_active);
  const inactiveUsers = users.filter(user => !user.is_active);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <Users className="w-6 h-6 text-blue-500 mr-2" />
            <h2 className="text-xl font-bold text-gray-800">จัดการสมาชิก</h2>
          </div>
          <button
            onClick={handleAddUserClick}
            className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            เพิ่มสมาชิกใหม่
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-blue-500 mr-3" />
              <div>
                <p className="text-2xl font-bold text-blue-900">{activeUsers.length}</p>
                <p className="text-blue-700 text-sm">สมาชิกที่ใช้งานอยู่</p>
              </div>
            </div>
          </div>
          
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center">
              <Shield className="w-8 h-8 text-green-500 mr-3" />
              <div>
                <p className="text-2xl font-bold text-green-900">
                  {activeUsers.filter(u => u.role === 'admin').length}
                </p>
                <p className="text-green-700 text-sm">ผู้ดูแลระบบ</p>
              </div>
            </div>
          </div>
          
          <div className="bg-red-50 rounded-lg p-4">
            <div className="flex items-center">
              <UserIcon className="w-8 h-8 text-red-500 mr-3" />
              <div>
                <p className="text-2xl font-bold text-red-900">{inactiveUsers.length}</p>
                <p className="text-red-700 text-sm">ปิดใช้งานแล้ว</p>
              </div>
            </div>
          </div>
        </div>

        {/* Users List */}
        <div className="space-y-4">
          {activeUsers.map((user) => (
            <div key={user.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <h3 className="font-semibold text-lg text-gray-800 mr-3">{user.name}</h3>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      user.role === 'admin' 
                        ? 'bg-purple-100 text-purple-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {user.role === 'admin' ? 'ผู้ดูแลระบบ' : 'ผู้ใช้ทั่วไป'}
                    </span>
                  </div>
                  
                  <details className="mt-2">
                    <summary className="flex items-center justify-between text-sm font-medium text-gray-700 cursor-pointer">
                      <span>รายละเอียดผู้ใช้</span>
                      <ChevronDown className="w-4 h-4 transition-transform duration-200 group-open:rotate-180" />
                    </summary>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                      <div className="space-y-2">
                        <div className="flex items-center text-gray-600 text-sm">
                          <Mail className="w-4 h-4 mr-2" />
                          <span>{user.email}</span>
                        </div>
                        {user.phone && (
                          <div className="flex items-center text-gray-600 text-sm">
                            <Phone className="w-4 h-4 mr-2" />
                            <span>{user.phone}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="text-xs text-gray-500">
                        <p>สมัครเมื่อ: {new Date(user.created_at!).toLocaleDateString('th-TH')}</p>
                        <p>อัปเดตล่าสุด: {new Date(user.updated_at!).toLocaleDateString('th-TH')}</p>
                      </div>
                    </div>
                  </details>
                </div>
                
                <div className="flex space-x-2 ml-4">
                  <button
                    onClick={() => handleEdit(user)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="แก้ไข"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(user.id, user.name || user.email)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="ปิดใช้งาน"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {activeUsers.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">ยังไม่มีสมาชิก</h3>
            <p className="text-gray-600">เพิ่มสมาชิกใหม่เพื่อเริ่มต้นใช้งาน</p>
          </div>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                {editingUser ? 'แก้ไขสมาชิก' : 'เพิ่มสมาชิกใหม่'}
              </h3>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    อีเมล *
                  </label>
                  <input
                    id="email"
                    type="email"
                    {...register('email')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="example@email.com"
                    disabled={!!editingUser}
                  />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                </div>

                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    ชื่อ *
                  </label>
                  <input
                    id="name"
                    type="text"
                    {...register('name')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="ชื่อผู้ใช้"
                  />
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    เบอร์โทรศัพท์
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    {...register('phone')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0xx-xxx-xxxx"
                  />
                  {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
                </div>

                <div className="relative">
                  <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                    บทบาท
                  </label>
                  <select
                    id="role"
                    {...register('role')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                  >
                    <option value="user">ผู้ใช้ทั่วไป</option>
                    <option value="admin">ผู้ดูแลระบบ</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                  {errors.role && <p className="text-red-500 text-xs mt-1">{errors.role.message}</p>}
                </div>

                <div className="flex items-center">
                  <input
                    id="is_active"
                    type="checkbox"
                    {...register('is_active')}
                    className="mr-2"
                  />
                  <label htmlFor="is_active" className="text-sm text-gray-700">
                    เปิดใช้งาน
                  </label>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => { setShowForm(false); reset(); setEditingUser(null); }}
                    disabled={submitting}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 flex items-center justify-center"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        กำลังบันทึก...
                      </>
                    ) : (
                      editingUser ? 'อัปเดต' : 'เพิ่มสมาชิก'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
