import { Room } from '../types';

export const rooms: Room[] = [
  {
    id: 'large-room',
    name: 'ห้องใหญ่ ชั้น 2',
    capacity: 12,
    description: 'ห้องประชุมใหญ่สำหรับการประชุมทีมใหญ่และงานสำคัญ',
    amenities: ['จอ LED TV', 'ระบบเสียง', 'WiFi', 'เครื่องปรับอากาศ'],
    color: 'from-blue-500 to-blue-600'
  },
  {
    id: 'medium-room',
    name: 'ห้องกลาง ชั้น 2',
    capacity: 8,
    description: 'ห้องประชุมขนาดกลางเหมาะสำหรับการประชุมทีมงาน',
    amenities: ['โปรเจคเตอร์', 'WiFi', 'เครื่องปรับอากาศ'],
    color: 'from-green-500 to-green-600'
  },
  {
    id: 'small-room',
    name: 'ห้องเล็ก ชั้น 1',
    capacity: 5,
    description: 'ห้องประชุมเล็กสำหรับการประชุมส่วนตัวและงานเร่งด่วน',
    amenities: ['โปรเจคเตอร์', 'WiFi', 'เครื่องปรับอากาศ'],
    color: 'from-orange-500 to-orange-600'
  }
];