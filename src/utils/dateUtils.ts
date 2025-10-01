export const formatDate = (date: Date, locale: 'en' | 'thai' = 'en'): string => {
  if (locale === 'thai') {
    return date.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const formatDateThai = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

// Modified formatTime to accept a time string (e.g., "HH:MM")
export const formatTime = (timeString: string): string => {
  // Assuming timeString is in "HH:MM" format
  const [hours, minutes] = timeString.split(':').map(Number);
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};

export const isPastTime = (time: string, compareDate: Date): boolean => {
  const [hours, minutes] = time.split(':').map(Number);
  const slotDateTime = new Date(compareDate);
  slotDateTime.setHours(hours, minutes, 0, 0);
  return slotDateTime < compareDate;
};

export const isPastDate = (dateString: string): boolean => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const checkDate = new Date(dateString);
  checkDate.setHours(0, 0, 0, 0);
  return checkDate < today;
};

export const isToday = (dateString: string): boolean => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const checkDate = new Date(dateString);
  checkDate.setHours(0, 0, 0, 0);
  return checkDate.getTime() === today.getTime();
};
