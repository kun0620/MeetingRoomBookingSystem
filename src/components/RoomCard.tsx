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
  // Debug log to check room data
  console.log('Room data:', room);
  
  // Fallback values in case data is missing
  const roomName = room?.name || 'ห้องประชุม';
  const roomCapacity = room?.capacity || 0;
  const roomColor = room?.color || 'from-blue-500 to-blue-600';
  const roomDescription = room?.description || 'ห้องประชุมสำหรับการประชุม';
  const roomAmenities = room?.amenities || [];

  return (
    <div
      onClick={() => !submitting && onSelect(room)}
      className={`bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer ${
        isSelected ? 'ring-2 ring-blue-500 ring-offset-2' : ''
      } ${
        submitting ? 'cursor-not-allowed opacity-50' : ''
      }`}
    >
      <div className={`h-32 rounded-t-xl bg-gradient-to-br ${roomColor} flex items-center justify-center`}>
        <div className="text-center text-white">
          <h3 className="text-2xl font-bold mb-2">{roomName}</h3>
          <div className="flex items-center justify-center text-white/90">
            <Users className="w-5 h-5 mr-2" />
            <span className="text-lg font-medium">สูงสุด {roomCapacity} คน</span>
          </div>
        </div>
      </div>
      
      <div className="p-6">
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