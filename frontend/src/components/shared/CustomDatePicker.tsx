import { useState } from "react";
import { Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface CustomDatePickerProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function CustomDatePicker({
  value,
  onChange,
  placeholder = "Select date",
}: CustomDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedYear, setSelectedYear] = useState<number>(() => {
    if (value) {
      return new Date(value).getFullYear();
    }
    return new Date().getFullYear();
  });
  const [selectedMonth, setSelectedMonth] = useState<number>(() => {
    if (value) {
      return new Date(value).getMonth();
    }
    return new Date().getMonth();
  });

  const [showMonthSelect, setShowMonthSelect] = useState(false);

  const months = [
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

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const handleDateSelect = (day: number) => {
    const date = new Date(selectedYear, selectedMonth, day);
    const formattedDate = date.toISOString().split("T")[0];
    onChange(formattedDate);
    setIsOpen(false);
  };

  const handleMonthScroll = (direction: "up" | "down") => {
    if (direction === "up") {
      if (selectedMonth === 0) {
        setSelectedMonth(11);
        setSelectedYear((prev) => Math.max(2025, prev - 1));
      } else {
        setSelectedMonth((prev) => prev - 1);
      }
    } else {
      if (selectedMonth === 11) {
        setSelectedMonth(0);
        setSelectedYear((prev) => Math.min(2030, prev + 1));
      } else {
        setSelectedMonth((prev) => prev + 1);
      }
    }
  };

  const formatDisplayDate = () => {
    if (!value) return placeholder;
    const [year, month, day] = value.split("-");
    return `${Number(month)}/${Number(day)}/${year}`;
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(selectedYear, selectedMonth);
    const firstDayOfMonth = new Date(selectedYear, selectedMonth, 1).getDay();
    const days = [];

    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="p-2"></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const isSelected =
        value &&
        (() => {
          const selected = new Date(selectedYear, selectedMonth, day);
          const selectedStr = selected.toISOString().split("T")[0];
          return value === selectedStr;
        })();

      days.push(
        <Button
          key={day}
          variant={isSelected ? "default" : "ghost"}
          size="sm"
          className="p-2 h-8 w-8"
          onClick={() => handleDateSelect(day)}
        >
          {day}
        </Button>
      );
    }

    return days;
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-start text-left font-normal"
        >
          <Calendar className="ml-2 h-4 w-4" />
          {formatDisplayDate()}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto p-0"
        align="start"
        side="bottom"
        avoidCollisions={false}
        alignOffset={-40}
      >
        <div className="p-3 space-y-3">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleMonthScroll("up")}
            >
              ←
            </Button>
            <div className="relative">
              <button
                type="button"
                className="font-medium px-2 py-1 rounded hover:bg-accent/30 transition-colors"
                onClick={() => setShowMonthSelect((v) => !v)}
              >
                {months[selectedMonth]} {selectedYear}
              </button>
              {showMonthSelect && (
                <div className="absolute left-1/2 z-10 mt-2 w-40 -translate-x-1/2 rounded-md border bg-popover shadow-lg max-h-64 overflow-y-auto">
                  {months.map((monthName, index) => (
                    <div
                      key={monthName}
                      className={`px-3 py-2 cursor-pointer hover:bg-accent/40 text-center ${index === selectedMonth ? "bg-accent/20 font-semibold" : ""}`}
                      onClick={() => {
                        setSelectedMonth(index);
                        setShowMonthSelect(false);
                      }}
                    >
                      {monthName}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => handleMonthScroll("down")}
            >
              →
            </Button>
          </div>

          <div className="grid grid-cols-7 gap-1">
            {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
              <div
                key={day}
                className="p-0 text-center text-sm font-medium text-muted-foreground"
              >
                {day}
              </div>
            ))}
            {renderCalendar()}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
