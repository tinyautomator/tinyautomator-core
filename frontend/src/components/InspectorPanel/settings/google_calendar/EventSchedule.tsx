import { useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import type {
  EventSchedule,
  StartTiming,
  Duration,
} from "./utils/calendarValidation";

interface EventScheduleProps {
  value: EventSchedule;
  onChange: (value: EventSchedule) => void;
}

const PRESET_LENGTH_DURATIONS = [
  { minutes: 15, label: "15 minutes" },
  { minutes: 30, label: "30 minutes" },
  { minutes: 60, label: "1 hour" },
  { minutes: 120, label: "2 hours" },
  { minutes: 240, label: "4 hours" },
  { minutes: 480, label: "8 hours" },
  { minutes: 720, label: "12 hours" },
] as const;

export function EventSchedule({ value, onChange }: EventScheduleProps) {
  const handleStartChange = useCallback(
    (updates: Partial<StartTiming>) => {
      onChange({
        ...value,
        start: { ...value.start, ...updates },
      });
    },
    [value, onChange],
  );

  const handleDurationChange = useCallback(
    (updates: Partial<Duration>) => {
      onChange({
        ...value,
        duration: { ...value.duration, ...updates },
      });
    },
    [value, onChange],
  );

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="space-y-4 max-w-md">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div className="space-y-2">
              <Label>When to schedule</Label>
              <Select
                value={value.start.type}
                onValueChange={(type: StartTiming["type"]) =>
                  handleStartChange({ type })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="immediate">Right away</SelectItem>
                  <SelectItem value="next-day">Tomorrow</SelectItem>
                  <SelectItem value="custom">Custom delay</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {value.start.type === "custom" && (
              <div className="space-y-2">
                <Label>Days</Label>
                <Input
                  type="number"
                  min="1"
                  max="30"
                  aria-label="Days to delay"
                  value={value.start.days || 1}
                  onChange={(e) =>
                    handleStartChange({
                      days: Number.parseInt(e.target.value) || 1,
                    })
                  }
                  className="max-w-[6rem]"
                />
              </div>
            )}
          </div>

          {value.start.type !== "immediate" && (
            <div className="space-y-2">
              <Label>At what time?</Label>
              <Input
                type="time"
                value={value.start.time || "14:00"}
                onChange={(e) => handleStartChange({ time: e.target.value })}
                className={cn(
                  "max-w-[7rem] p-2 border rounded",
                  "bg-background text-foreground border-input",
                  "dark:[&::-webkit-calendar-picker-indicator]:invert",
                )}
              />
            </div>
          )}

          <div className="space-y-2">
            <div className="flex items-center gap-5">
              <Switch
                checked={value.duration.isAllDay}
                onCheckedChange={(isAllDay) =>
                  handleDurationChange({ isAllDay })
                }
              />
              <span className="text-sm text-muted-foreground">
                {value.duration.isAllDay ? "All day event" : "Timed event"}
              </span>
            </div>

            {!value.duration.isAllDay && (
              <div className="space-y-2">
                <Label>Event duration</Label>
                <Select
                  value={value.duration.minutes?.toString()}
                  onValueChange={(minutesStr) => {
                    const minutes = Number(minutesStr);
                    const preset = PRESET_LENGTH_DURATIONS.find(
                      (p) => p.minutes === minutes,
                    );
                    if (preset) {
                      handleDurationChange({
                        isAllDay: false,
                        minutes: preset.minutes,
                      });
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PRESET_LENGTH_DURATIONS.map((preset) => (
                      <SelectItem
                        key={preset.minutes}
                        value={preset.minutes.toString()}
                      >
                        {preset.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
