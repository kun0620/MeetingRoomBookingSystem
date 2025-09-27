import React, { useState } from 'react';
import { useAdminRooms } from '../../hooks/useAdminRooms';
import { Building, Plus, CreditCard as Edit, Trash2, Users, Loader2 } from 'lucide-react';
import { Room } from '../../types';
import { v4 as uuidv4 } from 'uuid'; // Import uuid

export default function AdminRooms() {
  const { rooms, loading, createRoom, updateRoom, deleteRoom } = useAdminRooms();
  const [showForm, setShowForm] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    id: '',
    name: '',
    capacity: 0,
    description: '',
    amenities: [] as string[],
    color: 'from-blue-500 to-blue-600', // Keep color for now, as it's in the type and will be passed through
    image_url: '' // Add image_url
  });

  // Removed colorOptions as it's no longer needed for selection
  const amenityOptions = [
    'โปรเจคเตอร์',
    'จอ LED TV',
    'จอ Monitor',
    'ระบบเสียง',
    'WiFi',
    'เครื่องปรับอากาศ',
    'กระดานไวท์บอร์ด',
    'โต๊ะประชุม',
    'เก้าอี้สำนักงาน'
  ];

  const resetForm = () => {
    setFormData({
      id: '', // Reset ID
      name: '',
      capacity: 0,
      description: '',
      amenities: [],
      color: 'from-blue-500 to-blue-600', // Reset to a default color
      image_url: ''
    });
    setEditingRoom(null);
    setShowForm(false);
  };

  const handleAddRoomClick = () => {
    resetForm(); // Clear form
    setFormData(prev => ({ ...prev, id: uuidv4() })); // Generate new ID for creation
    setShowForm(true);
  };

  const handleEdit = (room: Room) => {
    setFormData({
      id: room.id,
      name: room.name,
      capacity: room.capacity,
      description: room.description,
      amenities: room.amenities,
      color: room.color, // Populate existing color, but it won't be editable
      image_url: room.image_url || '' // Populate image_url
    });
    setEditingRoom(room);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (editingRoom) {
        // For updating, send all formData including id and existing color
        await updateRoom(editingRoom.id, formData);
        alert('อัปเดตห้องสำเร็จ!');
      } else {
        // For creating, formData.id should already be a UUID from handleAddRoomClick
        await createRoom(formData); // Pass formData directly, as id is now generated
        alert('เพิ่มห้องสำเร็จ!');
      }
      resetForm();
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      alert(`เกิดข้อผิดพลาด: ${error instanceof Error ? error.message : 'ไม่สามารถบันทึกข้อมูลได้'}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (roomId: string, roomName: string) => {
    if (confirm(`คุณต้องการลบห้อง "${roomName}" หรือไม่?`)) {
      try {
        await deleteRoom(roomId);
        alert('ลบห้องสำเร็จ!');
      } catch (error) {
        console.error('Error in handleDelete:', error);
        alert(`เกิดข้อผิดพลาด: ${error instanceof Error ? error.message : 'ไม่สามารถลบห้องได้'}`);
      }
    }
  };

  const handleAmenityChange = (amenity: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      amenities: checked 
        ? [...prev.amenities, amenity]
        : prev.amenities.filter(a => a !== amenity)
    }));
  };

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
            <Building className="w-6 h-6 text-blue-500 mr-2" />
            <h2 className="text-xl font-bold text-gray-800">จัดการห้องประชุม</h2>
          </div>
          <button
            onClick={handleAddRoomClick}
            className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            เพิ่มห้องใหม่
          </button>
        </div>

        {/* Room List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {rooms.map((room) => (
            <div key={room.id} className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="h-32 overflow-hidden">
                <img 
                  src={room.image_url || 'https://images.pexels.com/photos/260689/pexels-photo-260689.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'} 
                  alt={room.name} 
                  className="w-full h-full object-cover" 
                />
              </div>
              
              <div className="p-4">
                <h3 className="font-bold text-gray-800 mb-1">{room.name}</h3>
                <div className="flex items-center text-gray-600 text-sm mb-3">
                  <Users className="w-4 h-4 mr-1" />
                  {room.capacity} คน
                </div>
                <p className="text-gray-600 text-sm mb-3">{room.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">
                    {room.amenities.length} สิ่งอำนวยความสะดวก
                  </span>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(room)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(room.id, room.name)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                {editingRoom ? 'แก้ไขห้องประชุม' : 'เพิ่มห้องประชุมใหม่'}
              </h3>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* ID field is always shown but disabled, and pre-filled for new rooms */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      รหัสห้อง *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.id}
                      onChange={(e) => setFormData(prev => ({ ...prev, id: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-100"
                      placeholder="เช่น ROOM-001"
                      disabled={true} // ID should always be disabled as it's a primary key and generated/fixed
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ชื่อห้อง *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="เช่น ห้องประชุมใหญ่"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ความจุ (คน) *
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={formData.capacity}
                      onChange={(e) => setFormData(prev => ({ ...prev, capacity: parseInt(e.target.value) }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  {/* Removed the color theme selection input */}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    URL รูปภาพห้อง
                  </label>
                  <input
                    type="url"
                    value={formData.image_url}
                    onChange={(e) => setFormData(prev => ({ ...prev, image_url: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="เช่น https://images.pexels.com/photos/..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    คำอธิบาย
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="อธิบายเกี่ยวกับห้องประชุม"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    สิ่งอำนวยความสะดวก
                  </label>
                  <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 gap-2">
                    {amenityOptions.map(amenity => (
                      <label key={amenity} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.amenities.includes(amenity)}
                          onChange={(e) => handleAmenityChange(amenity, e.target.checked)}
                          className="mr-2"
                        />
                        <span className="text-sm">{amenity}</span>
                      </label>
                    ))}
                  </div>
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
                      editingRoom ? 'อัปเดต' : 'เพิ่มห้อง'
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
