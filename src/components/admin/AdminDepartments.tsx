import React, { useState } from 'react';
import { useDepartmentCodes } from '../../hooks/useDepartmentCodes';
import { Building2, Plus, Edit, Trash2, Loader2, Shield, Users, Tag } from 'lucide-react';
import { DepartmentCode } from '../../types';

export default function AdminDepartments() {
  const { 
    departmentCodes, 
    loading, 
    createDepartmentCode, 
    updateDepartmentCode, 
    deleteDepartmentCode 
  } = useDepartmentCodes();
  
  const [showForm, setShowForm] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<DepartmentCode | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    code: '',
    department_name: '',
    role: 'user' as 'admin' | 'user'
  });

  const resetForm = () => {
    setFormData({
      code: '',
      department_name: '',
      role: 'user'
    });
    setEditingDepartment(null);
    setShowForm(false);
  };

  const handleAddDepartmentClick = () => {
    resetForm();
    setShowForm(true);
  };

  const handleEdit = (department: DepartmentCode) => {
    setFormData({
      code: department.code,
      department_name: department.department_name,
      role: department.role as 'admin' | 'user'
    });
    setEditingDepartment(department);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (editingDepartment) {
        await updateDepartmentCode(editingDepartment.id, formData);
        alert('อัปเดตแผนกสำเร็จ!');
      } else {
        await createDepartmentCode(formData);
        alert('เพิ่มแผนกสำเร็จ!');
      }
      resetForm();
    } catch (error) {
      alert(`เกิดข้อผิดพลาด: ${error instanceof Error ? error.message : 'ไม่สามารถบันทึกข้อมูลได้'}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (departmentId: string, departmentName: string) => {
    if (confirm(`คุณต้องการลบแผนก "${departmentName}" หรือไม่?`)) {
      try {
        await deleteDepartmentCode(departmentId);
        alert('ลบแผนกสำเร็จ!');
      } catch (error) {
        alert(`เกิดข้อผิดพลาด: ${error instanceof Error ? error.message : 'ไม่สามารถลบแผนกได้'}`);
      }
    }
  };

  const adminDepartments = departmentCodes.filter(dept => dept.role === 'admin');
  const userDepartments = departmentCodes.filter(dept => dept.role === 'user');

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
            <Building2 className="w-6 h-6 text-blue-500 mr-2" />
            <h2 className="text-xl font-bold text-gray-800">จัดการแผนก</h2>
          </div>
          <button
            onClick={handleAddDepartmentClick}
            className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            เพิ่มแผนกใหม่
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center">
              <Building2 className="w-8 h-8 text-blue-500 mr-3" />
              <div>
                <p className="text-2xl font-bold text-blue-900">{departmentCodes.length}</p>
                <p className="text-blue-700 text-sm">แผนกทั้งหมด</p>
              </div>
            </div>
          </div>
          
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex items-center">
              <Shield className="w-8 h-8 text-purple-500 mr-3" />
              <div>
                <p className="text-2xl font-bold text-purple-900">{adminDepartments.length}</p>
                <p className="text-purple-700 text-sm">แผนกผู้ดูแล</p>
              </div>
            </div>
          </div>
          
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-green-500 mr-3" />
              <div>
                <p className="text-2xl font-bold text-green-900">{userDepartments.length}</p>
                <p className="text-green-700 text-sm">แผนกผู้ใช้ทั่วไป</p>
              </div>
            </div>
          </div>
        </div>

        {/* Departments List */}
        <div className="space-y-4">
          {departmentCodes.map((department) => (
            <div key={department.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <Tag className="w-5 h-5 text-gray-500 mr-2" />
                    <h3 className="font-semibold text-lg text-gray-800 mr-3">{department.department_name}</h3>
                    <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded text-gray-600">
                      {department.code}
                    </span>
                    <span className={`ml-3 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      department.role === 'admin' 
                        ? 'bg-purple-100 text-purple-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {department.role === 'admin' ? 'ผู้ดูแลระบบ' : 'ผู้ใช้ทั่วไป'}
                    </span>
                  </div>
                  
                  <div className="text-xs text-gray-500">
                    <p>สร้างเมื่อ: {new Date(department.created_at).toLocaleDateString('th-TH')}</p>
                  </div>
                </div>
                
                <div className="flex space-x-2 ml-4">
                  <button
                    onClick={() => handleEdit(department)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="แก้ไข"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(department.id, department.department_name)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="ลบ"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {departmentCodes.length === 0 && (
          <div className="text-center py-12">
            <Building2 className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">ยังไม่มีแผนก</h3>
            <p className="text-gray-600">เพิ่มแผนกใหม่เพื่อเริ่มต้นใช้งาน</p>
          </div>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                {editingDepartment ? 'แก้ไขแผนก' : 'เพิ่มแผนกใหม่'}
              </h3>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    รหัสแผนก *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                    placeholder="เช่น IT, HR, MKG"
                    disabled={!!editingDepartment}
                  />
                  {editingDepartment && (
                    <p className="text-xs text-gray-500 mt-1">ไม่สามารถแก้ไขรหัสแผนกได้</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ชื่อแผนก *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.department_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, department_name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="เช่น แผนกเทคโนโลยีสารสนเทศ"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    สิทธิ์การใช้งาน
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value as 'admin' | 'user' }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="user">ผู้ใช้ทั่วไป</option>
                    <option value="admin">ผู้ดูแลระบบ</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    ผู้ดูแลระบบสามารถเข้าถึงหน้าจัดการได้
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <button
                    type="button"
                    onClick={resetForm}
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
                      editingDepartment ? 'อัปเดต' : 'เพิ่มแผนก'
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