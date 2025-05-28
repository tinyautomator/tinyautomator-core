import { useEffect, useMemo, useRef, useState } from "react";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  format,
  parse,
  addMonths,
  subMonths,
  getYear,
  getMonth,
  isSameDay,
  isBefore,
  startOfDay,
  getDaysInMonth as dfGetDaysInMonth,
  setDate as dfSetDate,
  setMonth as dfSetMonth,
  setYear as dfSetYear,
  isValid,
} from "date-fns";

interface CustomDatePickerProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const MIN_YEAR_DP = new Date().getFullYear() - 0;
const MAX_YEAR_DP = new Date().getFullYear() + 2;

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export function CustomDatePicker({
  value,
  onChange,
  placeholder = "Select date",
}: CustomDatePickerProps) {
  const monthDropdownRef = useRef<HTMLDivElement>(null);
  const yearDropdownRef = useRef<HTMLDivElement>(null);

  const parsedValueDate = useMemo(() => {
    if (!value) return null;
    const d = parse(value, "yyyy-MM-dd", new Date());
    return isValid(d) ? d : null;
  }, [value]);

  const today = useMemo(() => startOfDay(new Date()), []);

  const [currentDisplayDate, setCurrentDisplayDate] = useState<Date>(
    parsedValueDate ||
      dfSetYear(
        dfSetMonth(today, new Date().getMonth()),
        Math.max(MIN_YEAR_DP, Math.min(MAX_YEAR_DP, getYear(today))),
      ),
  );

  useEffect(() => {
    const year = getYear(currentDisplayDate);
    if (year < MIN_YEAR_DP) {
      setCurrentDisplayDate((prev) =>
        dfSetYear(dfSetMonth(prev, 0), MIN_YEAR_DP),
      );
    } else if (year > MAX_YEAR_DP) {
      setCurrentDisplayDate((prev) =>
        dfSetYear(dfSetMonth(prev, 11), MAX_YEAR_DP),
      );
    }
  }, [currentDisplayDate]);

  const [isOpen, setIsOpen] = useState(false);
  const [showMonthSelect, setShowMonthSelect] = useState(false);
  const [showYearSelect, setShowYearSelect] = useState(false);

  const selectedCalendarYear = getYear(currentDisplayDate);
  const selectedCalendarMonth = getMonth(currentDisplayDate);

  const handleDateSelect = (day: number) => {
    const newSelectedDate = dfSetDate(
      dfSetMonth(
        dfSetYear(currentDisplayDate, selectedCalendarYear),
        selectedCalendarMonth,
      ),
      day,
    );
    onChange(format(newSelectedDate, "yyyy-MM-dd"));
    setIsOpen(false);
  };

  const handleMonthYearNavigation = (direction: "prev" | "next") => {
    let newDisplayDate;
    if (direction === "prev") {
      newDisplayDate = subMonths(currentDisplayDate, 1);
    } else {
      newDisplayDate = addMonths(currentDisplayDate, 1);
    }

    if (getYear(newDisplayDate) < MIN_YEAR_DP) {
      newDisplayDate = dfSetMonth(
        dfSetYear(currentDisplayDate, MIN_YEAR_DP),
        0,
      );
    } else if (getYear(newDisplayDate) > MAX_YEAR_DP) {
      newDisplayDate = dfSetMonth(
        dfSetYear(currentDisplayDate, MAX_YEAR_DP),
        11,
      );
    }
    setCurrentDisplayDate(newDisplayDate);
  };

  const handleMonthSelectChange = (monthIndex: number) => {
    setCurrentDisplayDate(dfSetMonth(currentDisplayDate, monthIndex));
    setShowMonthSelect(false);
  };

  const handleYearSelectChange = (year: number) => {
    setCurrentDisplayDate(
      dfSetYear(
        currentDisplayDate,
        Math.max(MIN_YEAR_DP, Math.min(MAX_YEAR_DP, year)),
      ),
    );
    setShowYearSelect(false);
  };

  const formatDisplayDateForTrigger = () => {
    if (!parsedValueDate) return placeholder;
    return format(parsedValueDate, "MM/dd/yyyy");
  };

  const yearOptions = useMemo(() => {
    const years = [];
    for (let y = MIN_YEAR_DP; y <= MAX_YEAR_DP; y++) {
      years.push(y);
    }
    return years;
  }, []);

  const renderCalendarDays = () => {
    const daysInMonth = dfGetDaysInMonth(currentDisplayDate);
    const firstDayOfMonth = new Date(
      selectedCalendarYear,
      selectedCalendarMonth,
      1,
    ).getDay();
    const daysArray = [];

    for (let i = 0; i < firstDayOfMonth; i++) {
      daysArray.push(<div key={`empty-${i}`} className="p-2 h-8 w-8" />);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateOfCell = dfSetDate(
        dfSetMonth(
          dfSetYear(today, selectedCalendarYear),
          selectedCalendarMonth,
        ),
        day,
      );
      const isPastDay = isBefore(dateOfCell, today);
      const isCurrentSelectedDay = parsedValueDate
        ? isSameDay(dateOfCell, parsedValueDate)
        : false;

      daysArray.push(
        <Button
          key={day}
          variant={isCurrentSelectedDay ? "default" : "ghost"}
          size="sm"
          disabled={isPastDay}
          className={`p-2 h-8 w-8 rounded-md ${isPastDay ? "opacity-40 pointer-events-none" : "hover:bg-accent hover:text-accent-foreground"} ${isCurrentSelectedDay ? "bg-primary text-primary-foreground" : ""}`}
          onClick={() => handleDateSelect(day)}
        >
          {day}
        </Button>,
      );
    }
    return daysArray;
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        monthDropdownRef.current &&
        !monthDropdownRef.current.contains(event.target as Node)
      ) {
        setShowMonthSelect(false);
      }
      if (
        yearDropdownRef.current &&
        !yearDropdownRef.current.contains(event.target as Node)
      ) {
        setShowYearSelect(false);
      }
    }
    if (showMonthSelect || showYearSelect) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showMonthSelect, showYearSelect]);

  return (
    <Popover
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open);
        if (open && parsedValueDate) {
          setCurrentDisplayDate(parsedValueDate);
        } else if (open && !parsedValueDate) {
          const currentYear = getYear(today);
          const clampedYear = Math.max(
            MIN_YEAR_DP,
            Math.min(MAX_YEAR_DP, currentYear),
          );
          setCurrentDisplayDate(dfSetYear(today, clampedYear));
        }
        setShowMonthSelect(false);
        setShowYearSelect(false);
      }}
    >
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-start text-left font-normal min-h-[2.5rem] px-3"
        >
          <CalendarIcon className="mr-2 h-4 w-4 opacity-50 flex-shrink-0" />
          {formatDisplayDateForTrigger()}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto p-0 select-none min-w-[16vw]"
        align="start"
      >
        <div className="p-3 space-y-1">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleMonthYearNavigation("prev")}
              disabled={
                selectedCalendarYear === MIN_YEAR_DP &&
                selectedCalendarMonth === 0
              }
              aria-label="Previous month"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>

            <div className="flex items-center gap-1">
              <div className="relative" ref={monthDropdownRef}>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setShowMonthSelect((v) => !v);
                    setShowYearSelect(false);
                  }}
                  className="font-medium px-2 py-1 text-sm rounded-md hover:bg-accent"
                  aria-label={`Selected month: ${MONTH_NAMES[selectedCalendarMonth]}`}
                >
                  {MONTH_NAMES[selectedCalendarMonth]}
                  <ChevronDown className="ml-1 h-3 w-3 opacity-60" />
                </Button>
                {showMonthSelect && (
                  <div className="absolute left-1/2 z-20 mt-1 w-36 -translate-x-1/2 rounded-md border bg-popover shadow-lg max-h-48 overflow-y-auto">
                    {MONTH_NAMES.map((monthName, index) => (
                      <div
                        key={monthName}
                        className={`px-3 py-1.5 cursor-pointer hover:bg-accent text-sm text-center rounded-sm ${
                          index === selectedCalendarMonth
                            ? "bg-accent font-semibold"
                            : ""
                        }`}
                        onClick={() => handleMonthSelectChange(index)}
                      >
                        {monthName}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="relative" ref={yearDropdownRef}>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setShowYearSelect((v) => !v);
                    setShowMonthSelect(false);
                  }}
                  className="font-medium px-2 py-1 text-sm rounded-md hover:bg-accent"
                  aria-label={`Selected year: ${selectedCalendarYear}`}
                >
                  {selectedCalendarYear}
                  <ChevronDown className="ml-1 h-3 w-3 opacity-60" />
                </Button>
                {showYearSelect && (
                  <div className="absolute left-1/2 z-20 mt-1 w-24 -translate-x-1/2 rounded-md border bg-popover shadow-lg max-h-48 overflow-y-auto">
                    {yearOptions.map((year) => (
                      <div
                        key={year}
                        className={`px-3 py-1.5 cursor-pointer hover:bg-accent text-sm text-center rounded-sm ${
                          year === selectedCalendarYear
                            ? "bg-accent font-semibold"
                            : ""
                        }`}
                        onClick={() => handleYearSelectChange(year)}
                      >
                        {year}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleMonthYearNavigation("next")}
              disabled={
                selectedCalendarYear === MAX_YEAR_DP &&
                selectedCalendarMonth === 11
              }
              aria-label="Next month"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>

          <div className="grid grid-cols-7 gap-1 mt-1.5 text-center text-xs text-muted-foreground">
            {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
              <div key={day} className="font-medium p-1">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">{renderCalendarDays()}</div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
