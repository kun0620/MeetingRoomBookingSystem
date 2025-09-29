export const formatDate = (date: Date | null | undefined): string => {
  if (!date || isNaN(date.getTime())) {
    return 'N/A';
  }
  return date.toISOString().split('T')[0];
};

export const formatDateThai = (dateString: string | null | undefined): string => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    return 'N/A';
  }
  const thaiMonths = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
  ];

  const day = date.getDate();
  const month = thaiMonths[date.getMonth()];
  const year = date.getFullYear() + 543;

  return `${day} ${month} ${year}`;
};

export const isToday = (dateString: string | null | undefined): boolean => {
  if (!dateString) return false;
  const inputDate = new Date(dateString);
  if (isNaN(inputDate.getTime())) return false;

  const today = new Date();
  return inputDate.toISOString().split('T')[0] === today.toISOString().split('T')[0];
};

export const isPastDate = (dateString: string | null | undefined): boolean => {
  if (!dateString) return false;
  const inputDate = new Date(dateString);
  if (isNaN(inputDate.getTime())) return false;

  const today = new Date();
  // Compare only dates, not times
  const inputDateOnly = new Date(inputDate.getFullYear(), inputDate.getMonth(), inputDate.getDate());
  const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  return inputDateOnly < todayOnly;
};

export const formatTime = (timeString: string | null | undefined): string => {
  if (!timeString) return 'N/A';
  const parts = timeString.split(':');
  if (parts.length < 2) return 'N/A';
  const [hours, minutes] = parts;
  return `${hours}:${minutes}`;
};

export const formatDateTimeThai = (isoString: string | null | undefined, type: 'date' | 'time'): string => {
  if (!isoString) return 'N/A';
  const date = new Date(isoString);
  if (isNaN(date.getTime())) {
    return 'N/A';
  }
  if (type === 'date') {
    return formatDateThai(isoString);
  } else if (type === 'time') {
    // Extract HH:MM from ISO string for formatTime
    return formatTime(date.toISOString().substring(11, 16));
  }
  return 'N/A';
};
