import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { CalendarIcon, ChevronDownIcon, Clock, Coffee } from "lucide-react";
import { NewTimeEntry } from "@/utils/types";
import { Popover, PopoverContent, PopoverTrigger } from "@radix-ui/react-popover";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";

const dateFormatter = (date: Date) => {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};
export default function EntryForm({
  data,
  isUpdate,
  isSubmitting,
  handleInputChange,
  handleAddEntry,
  handleUpdateEntry,
}: {
  data: NewTimeEntry;
  isUpdate: boolean;
  isSubmitting: boolean;
  handleInputChange: React.ChangeEventHandler<HTMLInputElement>;
  handleAddEntry?: () => Promise<void>;
  handleUpdateEntry?: () => Promise<void>;
}) {

  const [date, setDate] = useState<Date | undefined>(undefined);

  return (
      <main>
        <div className="space-y-4">
          <div>
            <Label htmlFor="date" className="flex items-center gap-1 mb-2">
              <CalendarIcon className="w-4 h-4" />
              Enter Date
            </Label>
 
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  id="date"
                  className="w-full justify-between font-normal"
                >
                  {date ? dateFormatter(date) : "Select date"}
                  <ChevronDownIcon />
                </Button>
              </PopoverTrigger>
              <PopoverContent align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  captionLayout="dropdown"
                  onSelect={(date) => {
                    setDate(date)
                    handleInputChange({
                      target: {
                        name: "date",
                        value: date?.toISOString() ?? "",
                      },
                    } as React.ChangeEvent<HTMLInputElement>)
                  }}
                />
              </PopoverContent>
            </Popover>
      
          </div>

          <div>
            <Label className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              Time In and Time Out
            </Label>
            <div className="flex gap-2 mt-1">
              <div className="w-1/2">
                <Input
                  type="time"
                  name="time_in"
                  placeholder="Enter time in"
                  value={data.time_in}
                  onChange={handleInputChange}
                  className="w-fit text-base"
                />
                <span className="text-xs text-gray-500">Time In</span>
              </div>
              <div className="w-1/2">
                <Input
                  type="time"
                  name="time_out"
                  placeholder="Enter time out"
                  value={data.time_out}
                  onChange={handleInputChange}
                  className="w-fit text-base"
                />
                <span className="text-xs text-gray-500">Time Out</span>
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="break_time" className="flex items-center gap-1 mb-2">
              <Coffee className="w-4 h-4" />
              Break Time
            </Label>
            <Select
              value={data.break_time}
              onValueChange={(value) => {
                handleInputChange({
                  target: {
                    name: "break_time",
                    value: value,
                  },
                } as React.ChangeEvent<HTMLInputElement>);
              }}
            >
              <SelectTrigger id="break_time" className="w-full">
                <SelectValue placeholder="Select break time" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">No Break</SelectItem>
                <SelectItem value="15">15 minutes</SelectItem>
                <SelectItem value="30">30 minutes</SelectItem>
                <SelectItem value="60">1 hour</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="mt-4">
          {!isUpdate ? (
            <Button
              disabled={isSubmitting}
              className="w-full text-foreground"
              onClick={handleAddEntry}
            >
              {isSubmitting ? (
                <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
              ) : (
                <p>Add Time Entry</p>
              )}
            </Button>
          ) : (
            <Button
              disabled={isSubmitting}
              className="w-full text-foreground"
              onClick={handleUpdateEntry}
            >
              {isSubmitting ? (
                <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
              ) : (
                <p>Update Time Entry</p>
              )}
            </Button>
          )}
        </div>
       
    </main>
  );
}
