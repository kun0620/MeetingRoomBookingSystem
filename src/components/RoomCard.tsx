import React from 'react';
import { Room } from '../types';
import { Users, Wifi, MonitorSpeaker, Tv, Volume2, Projector } from 'lucide-react';

interface RoomCardProps {
  room: Room;
  onSelect: (room: Room) => void;
  isSelected?: boolean;
  submitting?: boolean;
}

const getAmenityIcon = (amenity: string) => {
  switch (amenity) {
    case 'โปรเจคเตอร์':
      return <Projector className="w-4 h-4" />;
    case 'จอ LED TV':
    case 'จอ Monitor':
      return <Tv className="w-4 h-4" />;
    case 'ระบบเสียง':
      return <Volume2 className="w-4 h-4" />;
    case 'WiFi':
      return <Wifi className="w-4 h-4" />;
    default:
      return <MonitorSpeaker className="w-4 h-4" />;
  }
};

export default function RoomCard({ room, onSelect, isSelected = false, submitting = false }: RoomCardProps) {
  // Fallback values in case data is missing
  const roomName = room?.name || 'ห้องประชุม';
  const roomCapacity = room?.capacity || 0;
  const roomDescription = room?.description || 'ห้องประชุมสำหรับการประชุม';
  const roomAmenities = room?.amenities || [];
  const roomImageUrl = room?.image_url || 'https://images.pexels.com/photos/260689/pexels-photo-260689.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'; // Default image

  return (
    <div
      onClick={() => !submitting && onSelect(room)}
      className={`bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer ${
        isSelected ? 'ring-2 ring-blue-500 ring-offset-2' : ''
      } ${
        submitting ? 'cursor-not-allowed opacity-50' : ''
      }`}
    >
      <div className="relative h-48 overflow-hidden rounded-t-xl">
        <img src={roomImageUrl} alt={roomName} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
      </div>
      
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-1">{roomName}</h3>
        <div className="flex items-center text-gray-600 text-sm mb-4">
          <Users className="w-4 h-4 mr-1" />
          <span>สูงสุด {roomCapacity} คน</span>
        </div>
        <p className="text-gray-600 mb-4 leading-relaxed">{roomDescription}</p>
        
        <div className="space-y-3">
          <h4 className="font-semibold text-gray-800 text-sm uppercase tracking-wide">สิ่งอำนวยความสะดวก</h4>
          <div className="grid grid-cols-2 gap-2">
            {roomAmenities.map((amenity, index) => (
              <div key={index} className="flex items-center text-gray-600 text-sm">
                {getAmenityIcon(amenity)}
                <span className="ml-2">{amenity}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
