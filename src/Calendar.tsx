import React, { useState, useEffect } from 'react';
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isWithinInterval,
  isBefore
} from 'date-fns';
import { ChevronLeft, ChevronRight, Moon, Sun, Pin } from 'lucide-react';

interface CalendarProps {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const Calendar: React.FC<CalendarProps> = ({ theme, toggleTheme }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isFlipping, setIsFlipping] = useState(false);
  
  // Selection State
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [hoverDate, setHoverDate] = useState<Date | null>(null);

  // Notes state
  const [notes, setNotes] = useState(() => {
    const saved = localStorage.getItem('calendar-notes');
    return saved || 'Jot down some memos for this month...';
  });

  useEffect(() => {
    localStorage.setItem('calendar-notes', notes);
  }, [notes]);

  const handleNextMonth = () => {
    setIsFlipping(true);
    setTimeout(() => {
      setCurrentDate(addMonths(currentDate, 1));
      setTimeout(() => setIsFlipping(false), 50); // slight delay to restart animation
    }, 400); // Trigger data change mid-flip
  };

  const handlePrevMonth = () => {
    setIsFlipping(true);
    setTimeout(() => {
      setCurrentDate(subMonths(currentDate, 1));
      setTimeout(() => setIsFlipping(false), 50);
    }, 400);
  };

  const handleDateClick = (day: Date) => {
    if (!isSameMonth(day, currentDate)) return;

    if (!startDate || (startDate && endDate)) {
      setStartDate(day);
      setEndDate(null);
    } else if (startDate && !endDate) {
      if (isBefore(day, startDate)) {
        setStartDate(day);
      } else {
        setEndDate(day);
      }
    }
  };

  const handleDateHover = (day: Date) => {
    if (startDate && !endDate && isSameMonth(day, currentDate)) {
      setHoverDate(day);
    } else {
      setHoverDate(null);
    }
  };

  // Generate calendar days
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const startDateGrid = startOfWeek(monthStart);
  const endDateGrid = endOfWeek(monthEnd);

  const daysGrid = eachDayOfInterval({
    start: startDateGrid,
    end: endDateGrid
  });

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Check if a day has notes (mock logic: just randomly for visual effect or attach specific ones later)
  const hasEvent = (date: Date) => {
    // Just a placeholder for visual effect. 
    return dayjsRandomlyHasEvent(date);
  };

  const dayjsRandomlyHasEvent = (date: Date) => {
    return date.getDate() % 12 === 0;
  };

  return (
    <div className="app-container">
      <div className="header-controls">
        <h1 className="title">Plan Your Year</h1>
        <button className="btn-icon" onClick={toggleTheme} aria-label="Toggle Theme">
          {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        </button>
      </div>

      <div className={`wall-calendar ${isFlipping ? 'is-flipping' : ''}`}>
        <div className="flip-wrapper">
          {/* Top Half - The Image */}
          <div className="calendar-top">
            <img 
              src="/hero-image.png" 
              alt="Calendar Landscape" 
              className="calendar-hero-image"
            />
          </div>

          {/* Spiral Binding */}
          <div className="spiral-binding">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="hole">
                <div className="ring"></div>
              </div>
            ))}
          </div>

          {/* Bottom Half - Dates & Notes */}
          <div className="calendar-bottom">
            <div className="month-header">
              <div className="month-title">
                {format(currentDate, 'MMMM')} <span className="year">{format(currentDate, 'yyyy')}</span>
              </div>
              <div className="month-nav">
                <button className="btn-icon" onClick={handlePrevMonth}>
                  <ChevronLeft size={24} />
                </button>
                <button className="btn-icon" onClick={handleNextMonth}>
                  <ChevronRight size={24} />
                </button>
              </div>
            </div>

            <div className="calendar-grid">
              {weekDays.map(d => (
                <div key={d} className="weekday-header">{d}</div>
              ))}
              
              {daysGrid.map((day, idx) => {
                const isCurrentMonth = isSameMonth(day, currentDate);
                const isToday = isSameDay(day, new Date());
                const isSelectedStart = startDate ? isSameDay(day, startDate) : false;
                const isSelectedEnd = endDate ? isSameDay(day, endDate) : false;
                
                let isRange = false;
                if (startDate && endDate) {
                  isRange = isWithinInterval(day, { start: startDate, end: endDate });
                } else if (startDate && hoverDate && !isBefore(hoverDate, startDate)) {
                  isRange = isWithinInterval(day, { start: startDate, end: hoverDate });
                }

                return (
                  <div 
                    key={idx} 
                    className={`day-cell 
                      ${!isCurrentMonth ? 'other-month empty-cell' : ''} 
                      ${isToday ? 'today' : ''}
                      ${isSelectedStart ? 'selected-start' : ''}
                      ${isSelectedEnd ? 'selected-end' : ''}
                      ${isRange && !isSelectedStart && !isSelectedEnd ? 'selected-range' : ''}
                    `}
                    onClick={() => handleDateClick(day)}
                    onMouseEnter={() => handleDateHover(day)}
                    onMouseLeave={() => setHoverDate(null)}
                  >
                    <div className="day-number">
                      {format(day, 'd')}
                    </div>
                    {isCurrentMonth && hasEvent(day) && (
                      <div className="day-indicators">
                        <div className="indicator-dot"></div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Notes Sticky Section */}
            <div className="notes-section">
              <div className="pin"></div>
              <div className="notes-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Pin size={16} /> Monthly Memos
                </div>
              </div>
              <textarea 
                className="notes-input"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Write your important notes here..."
              />
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Calendar;
