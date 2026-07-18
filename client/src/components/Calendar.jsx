import { useMemo } from "react";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function getMonthGrid(year, month) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();
  const totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7;

  return Array.from({ length: totalCells }, (_, i) => {
    let day, date, isCurrentMonth;
    if (i < firstDay) {
      day = daysInPrevMonth - firstDay + i + 1;
      date = new Date(year, month - 1, day);
      isCurrentMonth = false;
    } else if (i >= firstDay + daysInMonth) {
      day = i - firstDay - daysInMonth + 1;
      date = new Date(year, month + 1, day);
      isCurrentMonth = false;
    } else {
      day = i - firstDay + 1;
      date = new Date(year, month, day);
      isCurrentMonth = true;
    }
    return { day, date, isCurrentMonth };
  });
}

function getWeekDays(date) {
  const start = new Date(date);
  start.setDate(start.getDate() - start.getDay());
  start.setHours(0, 0, 0, 0);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    return d;
  });
}

function formatDateKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function isToday(date) {
  const today = new Date();
  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  );
}

function isSameDate(a, b) {
  if (!a || !b) return false;
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function ViewToggle({ mode, onChange }) {
  const views = [
    { key: "month", label: "Month" },
    { key: "week", label: "Week" },
    { key: "day", label: "Day" },
  ];
  return (
    <div className="flex bg-gray-100 rounded-xl p-0.5" role="tablist">
      {views.map((v) => (
        <button
          key={v.key}
          type="button"
          role="tab"
          aria-selected={mode === v.key}
          onClick={() => onChange(v.key)}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer ${
            mode === v.key
              ? "bg-white text-indigo-700 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          {v.label}
        </button>
      ))}
    </div>
  );
}

function CalendarHeader({ currentDate, mode, onModeChange, onNavigate, onToday }) {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const date = currentDate.getDate();

  let title;
  if (mode === "month") title = `${MONTHS[month]} ${year}`;
  else if (mode === "week") {
    const weekDays = getWeekDays(currentDate);
    const start = weekDays[0];
    const end = weekDays[6];
    const sameMonth = start.getMonth() === end.getMonth();
    if (sameMonth && start.getFullYear() === end.getFullYear()) {
      title = `${MONTHS[start.getMonth()]} ${start.getDate()} - ${end.getDate()}, ${start.getFullYear()}`;
    } else {
      title = `${MONTHS[start.getMonth()]} ${start.getDate()} - ${MONTHS[end.getMonth()]} ${end.getDate()}, ${end.getFullYear()}`;
    }
  } else {
    title = `${MONTHS[month]} ${date}, ${year}`;
  }

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onNavigate(-1)}
          className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition cursor-pointer"
          aria-label="Previous"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h2 className="text-base font-bold text-gray-900 min-w-[180px] text-center">{title}</h2>
        <button
          type="button"
          onClick={() => onNavigate(1)}
          className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition cursor-pointer"
          aria-label="Next"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
        <button
          type="button"
          onClick={onToday}
          className="px-3 py-1.5 text-xs font-semibold text-indigo-600 hover:bg-indigo-50 rounded-lg transition cursor-pointer"
        >
          Today
        </button>
      </div>
      <ViewToggle mode={mode} onChange={onModeChange} />
    </div>
  );
}

function DayHeaders() {
  return (
    <div className="grid grid-cols-7 mb-1">
      {DAYS.map((d) => (
        <div key={d} className="text-center text-[10px] font-semibold text-gray-400 uppercase tracking-wider py-1">
          {d}
        </div>
      ))}
    </div>
  );
}

function MonthView({ grid, events, selectedDate, onSelectDate, renderDayContent }) {
  return (
    <div className="hidden sm:block">
      <DayHeaders />
      <div className="grid grid-cols-7 gap-px bg-gray-100 rounded-xl overflow-hidden border border-gray-100">
        {grid.map((cell, i) => {
          const dateKey = formatDateKey(cell.date);
          const eventData = events[dateKey];
          const isSelected = isSameDate(cell.date, selectedDate);
          const today = isToday(cell.date);
          return (
            <button
              key={i}
              type="button"
              onClick={() => onSelectDate(cell.date)}
              className={`min-h-[90px] p-1.5 text-left transition cursor-pointer hover:bg-gray-50 ${
                cell.isCurrentMonth ? "bg-white" : "bg-gray-50/50"
              } ${isSelected ? "ring-2 ring-indigo-500 ring-inset" : ""}`}
            >
              <span
                className={`inline-flex items-center justify-center w-6 h-6 text-xs font-medium rounded-full ${
                  today ? "bg-indigo-600 text-white" : cell.isCurrentMonth ? "text-gray-900" : "text-gray-400"
                }`}
              >
                {cell.day}
              </span>
              {renderDayContent && renderDayContent(dateKey, eventData)}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function MobileMonthView({ grid, events, selectedDate, onSelectDate, renderDayContent }) {
  const visibleCells = grid.filter((c) => c.isCurrentMonth);
  return (
    <div className="sm:hidden space-y-1">
      {visibleCells.map((cell, i) => {
        const dateKey = formatDateKey(cell.date);
        const eventData = events[dateKey];
        const isSelected = isSameDate(cell.date, selectedDate);
        const today = isToday(cell.date);
        return (
          <button
            key={i}
            type="button"
            onClick={() => onSelectDate(cell.date)}
            className={`w-full flex items-start gap-3 p-3 rounded-xl text-left transition cursor-pointer ${
              isSelected ? "ring-2 ring-indigo-500 bg-indigo-50/50" : today ? "bg-indigo-50" : "bg-white hover:bg-gray-50"
            }`}
          >
            <div className="flex flex-col items-center min-w-[40px]">
              <span className="text-[10px] font-semibold text-gray-400 uppercase">{DAYS[cell.date.getDay()]}</span>
              <span className={`text-lg font-bold ${today ? "text-indigo-600" : "text-gray-900"}`}>{cell.day}</span>
            </div>
            <div className="flex-1 min-w-0">
              {renderDayContent && renderDayContent(dateKey, eventData)}
            </div>
          </button>
        );
      })}
    </div>
  );
}

function WeekView({ weekDays, events, selectedDate, onSelectDate, renderDayContent }) {
  return (
    <div>
      <DayHeaders />
      <div className="grid grid-cols-7 gap-px bg-gray-100 rounded-xl overflow-hidden border border-gray-100">
        {weekDays.map((date, i) => {
          const dateKey = formatDateKey(date);
          const eventData = events[dateKey];
          const isSelected = isSameDate(date, selectedDate);
          const today = isToday(date);
          return (
            <button
              key={i}
              type="button"
              onClick={() => onSelectDate(date)}
              className={`min-h-[120px] p-1.5 text-left transition cursor-pointer hover:bg-gray-50 bg-white ${
                isSelected ? "ring-2 ring-indigo-500 ring-inset" : ""
              }`}
            >
              <span
                className={`inline-flex items-center justify-center w-6 h-6 text-xs font-medium rounded-full ${
                  today ? "bg-indigo-600 text-white" : "text-gray-900"
                }`}
              >
                {date.getDate()}
              </span>
              {renderDayContent && renderDayContent(dateKey, eventData)}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function DayView({ currentDate, events, renderDayContent }) {
  const dateKey = formatDateKey(currentDate);
  const eventData = events[dateKey];
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 min-h-[200px]">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-sm font-semibold text-gray-400 uppercase">{DAYS[currentDate.getDay()]}</span>
        <span className="text-2xl font-bold text-gray-900">{currentDate.getDate()}</span>
      </div>
      {renderDayContent && renderDayContent(dateKey, eventData, true)}
    </div>
  );
}

export default function Calendar({
  currentDate,
  onDateChange,
  events = {},
  selectedDate,
  onSelectDate,
  renderDayContent,
  detailPanel,
  mode,
  onModeChange,
}) {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const grid = useMemo(() => getMonthGrid(year, month), [year, month]);
  const weekDays = useMemo(() => getWeekDays(currentDate), [currentDate]);

  function navigate(delta) {
    const newDate = new Date(currentDate);
    if (mode === "month") newDate.setMonth(newDate.getMonth() + delta);
    else if (mode === "week") newDate.setDate(newDate.getDate() + delta * 7);
    else newDate.setDate(newDate.getDate() + delta);
    onDateChange(newDate);
  }

  function goToday() {
    onDateChange(new Date());
  }

  return (
    <div>
      <CalendarHeader
        currentDate={currentDate}
        mode={mode}
        onModeChange={onModeChange}
        onNavigate={navigate}
        onToday={goToday}
      />

      {mode === "month" && (
        <>
          <MonthView
            grid={grid}
            events={events}
            selectedDate={selectedDate}
            onSelectDate={onSelectDate}
            renderDayContent={renderDayContent}
          />
          <MobileMonthView
            grid={grid}
            events={events}
            selectedDate={selectedDate}
            onSelectDate={onSelectDate}
            renderDayContent={renderDayContent}
          />
        </>
      )}

      {mode === "week" && (
        <WeekView
          weekDays={weekDays}
          events={events}
          selectedDate={selectedDate}
          onSelectDate={onSelectDate}
          renderDayContent={renderDayContent}
        />
      )}

      {mode === "day" && (
        <DayView
          currentDate={currentDate}
          events={events}
          renderDayContent={renderDayContent}
        />
      )}

      {detailPanel && <div className="mt-4">{detailPanel}</div>}
    </div>
  );
}
