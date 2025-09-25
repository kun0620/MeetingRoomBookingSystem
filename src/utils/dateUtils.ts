export const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

export const formatDateThai = (dateString: string): string => {
  const date = new Date(dateString);
  const thaiMonths = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
  ];
  
  const day = date.getDate();
  const month = thaiMonths[date.getMonth()];
  const year = date.getFullYear() + 543;
  
  return `${day} ${month} ${year}`;
};

export const isToday = (dateString: string): boolean => {
  const today = formatDate(new Date());
  return dateString === today;
};

export const isPastDate = (dateString: string): boolean => {
  const today = formatDate(new Date());
  return dateString < today;
};