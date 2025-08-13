import { useState, useEffect } from 'react';

export const useTimer = () => {
  const [elapsedTime, setElapsedTime] = useState({ 
    years: 0, 
    months: 0, 
    days: 0, 
    minutes: 0, 
    seconds: 0, 
    milliseconds: 0
  });

  useEffect(() => {
    const getStartDate = () => {
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      
      let targetMonth = currentMonth - 1;
      let targetYear = currentYear;
      
      if (targetMonth < 0) {
        targetMonth = 11;
        targetYear = currentYear - 1;
      }
      
      return new Date(targetYear, targetMonth, 2);
    };

    const startDate = getStartDate();
    
    const updateElapsed = () => {
      const now = new Date();
      
      let years = now.getFullYear() - startDate.getFullYear();
      let months = now.getMonth() - startDate.getMonth();
      let days = now.getDate() - startDate.getDate();
      
      if (days < 0) {
        months--;
        const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
        days += prevMonth.getDate();
      }
      
      if (months < 0) {
        years--;
        months += 12;
      }
      
      const nowTime = performance.now();
      const startTime = startDate.getTime();
      const diffMs = nowTime - (startTime - performance.timeOrigin);
      
      const remainingMs = diffMs % (24 * 60 * 60 * 1000);
      const totalMilliseconds = Math.floor(remainingMs);
      const minutes = Math.floor(totalMilliseconds / 60000);
      const seconds = Math.floor((totalMilliseconds % 60000) / 1000);
      const milliseconds = totalMilliseconds % 1000;
      
      setElapsedTime({ years, months, days, minutes, seconds, milliseconds });
    };

    updateElapsed();
    const interval = setInterval(updateElapsed, 1);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (time: { years: number, months: number, days: number, minutes: number, seconds: number, milliseconds: number }) => {
    const parts = [];
    
    if (time.years > 0) {
      parts.push(time.years.toString());
    }
    
    parts.push(
      time.months.toString().padStart(2, '0'),
      time.days.toString().padStart(2, '0'),
      time.minutes.toString().padStart(2, '0'),
      time.seconds.toString().padStart(2, '0'),
      time.milliseconds.toString().padStart(3, '0')
    );
    
    return parts.join('.');
  };

  return {
    seconds: elapsedTime.minutes * 60 + elapsedTime.seconds,
    formattedTime: formatTime(elapsedTime),
    reset: () => setElapsedTime({ years: 0, months: 0, days: 0, minutes: 0, seconds: 0, milliseconds: 0 })
  };
};