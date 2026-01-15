"use client";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

import { TimeEntry } from "@/utils/types";
import { useContext, useState } from "react";
import toast from "react-hot-toast";
import { EntryContext } from "./EntryContext";
import useAuthUser from "@/hooks/useAuthUser";
import useEntryForm from "@/hooks/useEntryForm";
import EntryForm from "./EntryForm";
import { actionDeleteEntry, actionUpdateEntry } from "../";
import { SquarePen, Trash2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const timeFormat = (time: string) => {
  if (!time) return "";
  
  const [hours, minutes] = time.split(":");
  if (!hours || !minutes) return time; // Return original if format is unexpected
  
  const hour = parseInt(hours, 10);
  const minute = minutes.padStart(2, "0");
  
  // Convert 24-hour to 12-hour format
  const period = hour >= 12 ? "PM" : "AM";
  const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  
  return `${hour12}:${minute} ${period}`;
};

export default function EntriesCard({
  index,
  entry,
  totalHours,
}: {
  index: number;
  entry: TimeEntry;
  totalInputHours: number;
  totalHours: number;
}) {
  const {
    entryValue,
    setEntryValue,
    handleInputChange,
    isSubmitting,
    setIsSubmitting,
  } = useEntryForm();
  const entryContext = useContext(EntryContext);
  const { user } = useAuthUser();

  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const handleUpdateEntry = async (id: number) => {
    if (!entryValue.date) {
      alert("Please select a date");
      return;
    }

    if (!user?.id) {
      toast.error("Unexpected error occured");
      return;
    }

    setIsSubmitting(true);

    const { ok } = await actionUpdateEntry(id, user.id, {
      date: entryValue.date,
      time_in: entryValue.time_in,
      time_out: entryValue.time_out,
      break_time: entryValue.break_time,
    });

    if (!ok) {
      toast.error("Error adding time entry");
      return;
    }

    if (ok) {
      entryContext!.setTimeEntries((prevTimeEntries) =>
        prevTimeEntries.map((item) =>
          item.id === id ? { ...item, ...entryValue } : item
        )
      );

      toast.success("Entry updated successfully");
      setIsSubmitting(false);
    }
  };

  const handleDeleteEntry = async (id: number) => {
    if (!user?.id) {
      toast.error("Error deleting entry");
      return;
    }

    setIsDeleting(true);

    const { ok } = await actionDeleteEntry(id, user.id);

    if (!ok) {
      toast.error("Cannot delete entry");
      return;
    }

    if (ok) {
      toast.success("Deleted entry successfully");
      entryContext!.setTimeEntries((prev) =>
        prev.filter((entry) => entry.id !== id)
      );
    }

    setIsDeleting(false);
  };

  return (
    <div>
      <div key={entry.id} className="flex justify-between items-center">
        <div className="flex flex-col gap-0.5">
          {/* DATE */}
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-lg">
              {new Date(entry.date).toLocaleDateString("en-US", {
                weekday: "short",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </h3>
          </div>

          {/* HOURS RENDERED */}
          <div className="text-sm">
            {entry.time_in && (
              <div className="text-muted-foreground">
                <span>Time Rendered:</span>{" "}
                {timeFormat(entry.time_in)} - {timeFormat(entry.time_out)}       
              </div>
            )}
            {entry.break_time && (
              <div className="text-muted-foreground">
                <span>Break Time:</span> {timeFormat(entry.break_time)} minutes
              </div>
            )}
          </div>
          <div className="font-mono text-md">
            <span className="text-primary">
              {totalHours.toFixed(2)} hours
            </span>
          </div>
        </div>

        {/* BUTTON ACTIONS */}
        <div className="mt-2 flex flex-col md:flex-row justify-end gap-3 items-center">
          <Dialog key={index}>
            <DialogTrigger asChild>
              <Button
                onClick={() =>
                  setEntryValue({
                    date: entry.date,
                    time_in: entry.time_in,
                    time_out: entry.time_out,
                    break_time: entry.break_time,
                  })
                }
                variant="secondary"
                className="w-fit"
              >
                <SquarePen className="w-4 h-4" />
                <p className="hidden md:block">Edit</p>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Edit Time History</DialogTitle>
                <DialogDescription>
                  Edit your time history here and click Submit to save changes.
                </DialogDescription>
              </DialogHeader>
              <EntryForm
                data={entryValue}
                handleInputChange={handleInputChange}
                isSubmitting={isSubmitting}
                isUpdate={true}
                handleUpdateEntry={() => handleUpdateEntry(entry.id)}
              />
              <DialogFooter>
                <DialogClose asChild>
                  <Button
                    disabled={isSubmitting}
                    variant="outline"
                    type="button"
                    className="w-full"
                  >
                    Close
                  </Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Button
            disabled={isDeleting}
            variant="destructive"
            className="w-full md:w-fit"
            size="sm"
            onClick={() => handleDeleteEntry(entry.id)}
          >
            {isDeleting ? (
              <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
            ) : (
              <p><Trash2 className="w-4 h-4" /></p>
            )}
          </Button>
        </div>
      </div>

      <Separator className="my-2" />
    </div>
  );
}
