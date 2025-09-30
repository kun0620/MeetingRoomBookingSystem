import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { CalendarDay } from '../types';
import { formatDate, formatDateThai, isToday, isPastDate } from '../utils/dateUtils';

interface CalendarProps {
  selectedDate: string;
  onDateSelect: (date: string) => void;
  bookings: any[];
}

export default function Calendar({ selectedDate, onDateSelect, bookings }: CalendarProps) {
  const [currentMonth, setCurrentMonth] = React.useState(new Date());

  const getDaysInMonth = (date: Date): CalendarDay[] => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: CalendarDay[] = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      const prevDate = new Date(year, month, -startingDayOfWeek + i + 1);
      const dateString = formatDate(prevDate);
      days.push({
        date: dateString,
        isToday: isToday(dateString),
        isSelected: dateString === selectedDate,
        hasBookings: false,
        bookingsCount: 0
      });
    }

    // Add days of the current month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateString = formatDate(date);
      // Filter out cancelled bookings
      const dayBookings = bookings.filter(booking => booking.date === dateString && booking.status !== 'cancelled');
      
      days.push({
        date: dateString,
        isToday: isToday(dateString),
        isSelected: dateString === selectedDate,
        hasBookings: dayBookings.length > 0,
        bookingsCount: dayBookings.length
      });
    }

    // Add empty cells for days after the last day of the month to complete the last week
    // Calculate how many cells are already filled
    const totalCellsFilled = days.length;
    // We need to fill up to a multiple of 7 (e.g., 35 or 42 cells)
    const remainingCells = (7 - (totalCellsFilled % 7)) % 7;

    for (let i = 0; i < remainingCells; i++) {
      const nextDate = new Date(year, month + 1, i + 1); // Days from the next month
      const dateString = formatDate(nextDate);
      days.push({
        date: dateString,
        isToday: isToday(dateString),
        isSelected: dateString === selectedDate,
        hasBookings: false, // Bookings for next month days are not fetched here
        bookingsCount: 0
      });
    }

    return days;
  };

  const days = getDaysInMonth(currentMonth);
  const monthNames = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
  ];
  const dayNames = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'];

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const year = prev.getFullYear();
      const month = prev.getMonth();
      let newMonthDate;

      if (direction === 'prev') {
        newMonthDate = new Date(year, month - 1, 1); 
      } else {
        newMonthDate = new Date(year, month + 1, 1);
      }
      return newMonthDate;
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigateMonth('prev')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        
        <h2 className="text-xl font-bold text-gray-800">
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear() + 543}
        </h2>
        
        <button
          onClick={() => navigateMonth('next')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-2 mb-2">
        {dayNames.map(day => (
          <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {days.map((day, index) => {
          const isPast = isPastDate(day.date);
          const dayDate = new Date(day.date);
          const isCurrentMonth = dayDate.getMonth() === currentMonth.getMonth();
          
          return (
            <button
              key={index}
              onClick={() => !isPast && isCurrentMonth && onDateSelect(day.date)}
              disabled={isPast || !isCurrentMonth}
              className={`
                relative p-2 text-sm rounded-lg transition-all duration-200
                ${day.isSelected 
                  ? 'bg-blue-500 text-white' 
                  : isCurrentMonth 
                    ? isPast 
                      ? 'text-gray-300 cursor-not-allowed' 
                      : 'hover:bg-blue-50 text-gray-700'
                    : 'text-gray-300' // This applies to days not in current month
                }
                ${day.isToday && !day.isSelected ? 'ring-2 ring-blue-200' : ''}
              `}
            >
              {isCurrentMonth ? dayDate.getDate() : ''} {/* Render date only if it's in the current month */}
              {day.hasBookings && isCurrentMonth && (
                <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {day.bookingsCount}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
