import { useSystemSettings } from '../hooks/useSystemSettings';

// Generate time slots based on system settings
export const generateTimeSlots = (
  startTime: string = '08:00',
  endTime: string = '17:00',
  duration: number = 30
) => {
  const slots = [];
  const [startHour, startMinute] = startTime.split(':').map(Number);
  const [endHour, endMinute] = endTime.split(':').map(Number);
  
  const startTotalMinutes = startHour * 60 + startMinute;
  const endTotalMinutes = endHour * 60 + endMinute;
  
  for (let minutes = startTotalMinutes; minutes < endTotalMinutes; minutes += duration) {
    const hour = Math.floor(minutes / 60);
    const minute = minutes % 60;
    const nextMinutes = minutes + duration;
    const nextHour = Math.floor(nextMinutes / 60);
    const nextMinute = nextMinutes % 60;
    
    if (nextMinutes <= endTotalMinutes) {
      slots.push({
        time: `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`,
        end: `${String(nextHour).padStart(2, '0')}:${String(nextMinute).padStart(2, '0')}`
      });
    }
  }
  
  return slots;
};

// Default time slots (fallback)
export const timeSlots = generateTimeSlots();
