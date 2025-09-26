export const timeSlots = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
  '17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00'
];

export const formatTime = (time: string): string => {
  return time;
};

export const getTimeSlotIndex = (time: string): number => {
  return timeSlots.indexOf(time);
};

export const isValidTimeRange = (startTime: string, endTime: string): boolean => {
  const startIndex = getTimeSlotIndex(startTime);
  const endIndex = getTimeSlotIndex(endTime);
  return startIndex < endIndex && startIndex >= 0 && endIndex >= 0;
};
