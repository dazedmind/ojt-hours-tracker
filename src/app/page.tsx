"use client";

import React, { useState, useEffect, useContext } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertCircle,
  FlagTriangleLeft,
  History,
  Hourglass,
  SquareActivity,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import useAuthUser from "@/hooks/useAuthUser";
import useEntryForm from "@/hooks/useEntryForm";
import {
  actionCreateEntry,
  actionGetEntries,
  calculateEntryHours,
  EntriesCard,
  EntryContext,
  EntryForm,
} from "@/modules/entries";
import { useTheme } from "next-themes";
import { Separator } from "@/components/ui/separator";
import NavBar from "./modules/layout/NavBar";
import toast from "react-hot-toast";

export default function Home() {
  const {
    entryValue,
    setEntryValue,
    handleInputChange,
    isSubmitting,
    setIsSubmitting,
  } = useEntryForm();

  const entryContext = useContext(EntryContext);
  const [requiredHours, setRequiredHours] = useState<number>(0);
  const [completedHours, setCompletedHours] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [mounted, setMounted] = useState<boolean>(false);

  const { user, userLoading } = useAuthUser();
  const { theme } = useTheme();

  const completionPercentage: number =
    requiredHours === 0
      ? 0
      : Math.min(Math.round((completedHours / requiredHours) * 100), 100);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!localStorage.getItem("hours")) {
      localStorage.setItem("hours", "0");
    }

    async function fetchEntries() {
      if (!user?.id) {
        return;
      }

      const { ok, data } = await actionGetEntries(user.id);

      if (!ok) {
        toast.error("Error fetching entries");
        return;
      }

      if (!data) {
        toast.error("Error fetching entries");
        return;
      }

      setLoading(false);
      entryContext!.setTimeEntries(
        data.map((entry) => ({
          ...entry,
        }))
      );
    }

    fetchEntries();

    setRequiredHours(Number(localStorage.getItem("hours")));
  }, [userLoading]);

  useEffect(() => {
    let totalHours = 0;

    entryContext!.timeEntries.forEach((entryValue) => {
      const totalInputHours = calculateEntryHours(
        entryValue.time_in,
        entryValue.time_out,
        entryValue.break_time
      );

      totalHours += totalInputHours;
    });

    localStorage.setItem("entries", JSON.stringify(entryContext!.timeEntries));

    setCompletedHours(parseFloat(totalHours.toFixed(2)));
  }, [entryContext!.timeEntries]);

  const handleRequiredHoursChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ): void => {
    const value = parseInt(e.target.value) || 0;
    localStorage.setItem("hours", value.toString());
    setRequiredHours(value);
  };

  const handleAddEntry = async () => {
    if (!entryValue.date) {
      alert("Please select a date");
      return;
    }

    setIsSubmitting(true);

    const { ok, data } = await actionCreateEntry(user!.id, {
      date: new Date(entryValue.date).toLocaleDateString(),
      time_in: entryValue.time_in,
      time_out: entryValue.time_out,
      break_time: entryValue.break_time,
    });

    console.log("Data: ", data);
    if (!ok) {
      toast.error("Error creating entry");
      return;
    }

    if (!data) {
      toast.error("No data ent");
      return;
    }

    entryContext!.setTimeEntries((prev) => [
      ...prev,
      { ...entryValue, id: data.id },
    ]);

    toast.success("Added entry successfully");

    setIsSubmitting(false);

    setEntryValue({
      date: "",
      time_in: "",
      time_out: "",
      break_time: "",
    });
  };

  return (
    <div className="container mx-auto max-w-4xl px-4">
      <header>
        <NavBar />
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card className="shadow-md">
          <CardHeader className="gap-0">
            <CardTitle className="flex items-center gap-2">
              <FlagTriangleLeft className="w-4 h-4" />
              OJT Progress
            </CardTitle>
            <CardDescription>View your OJT progress here.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center">
            <div className="relative w-40 h-40">
              <div
                className="w-full h-full rounded-full"
                style={{
                  background: `conic-gradient(
                    ${
                      mounted && theme === "dark" ? "#00472E" : "#00FF66"
                    } ${completionPercentage}%,
                    ${
                      mounted && theme === "dark" ? "#232323" : "#e9e9e9"
                    } ${completionPercentage}%
                  )`,
                }}
              >
                <div className="absolute top-4 left-4 right-4 bottom-4 bg-primary rounded-full flex items-center justify-center flex-col">
                  <span className="text-4xl font-bold">
                    {completionPercentage}%
                  </span>
                  <span className="text-sm">Complete</span>
                </div>
              </div>
            </div>

            <div className="mt-4 w-full">
              <Progress value={completionPercentage} className="h-2" />
              <div className="flex justify-between text-sm mt-2">
                <span>{completedHours} hours completed</span>
                <span>{requiredHours} hours required</span>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <div className="w-full space-y-2">
              <p className="text-sm">
                Remaining Hours: {requiredHours - completedHours}
              </p>
              <span className="flex items-center justify-between gap-2">
                <Label htmlFor="requiredHours">Total Required Hours:</Label>
                <Input
                  id="requiredHours"
                  type="text"
                  value={requiredHours}
                  onChange={handleRequiredHoursChange}
                  className="mt-1 w-24"
                />
              </span>
            </div>
          </CardFooter>
        </Card>

        <Card className="shadow-md">
          <CardHeader className="gap-0">
            <CardTitle className="flex items-center gap-2">
              <Hourglass className="w-4 h-4" />
              Record Time Entry
            </CardTitle>
            <CardDescription>Record your time entry here.</CardDescription>
            <Separator className="my-2" />
          </CardHeader>
          <div className="px-6">
            <EntryForm
              data={entryValue}
              handleInputChange={handleInputChange}
              isSubmitting={isSubmitting}
              isUpdate={false}
              handleAddEntry={handleAddEntry}
            />
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SquareActivity className="w-4 h-4" /> Block View
            </CardTitle>
            <CardDescription>
              View your time entry history in a block view.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3">
              <div className="text-sm text-muted-foreground">
                <span className="font-medium">Total Days:</span>{" "}
                {Math.round(requiredHours / 8)} days
              </div>
              <div className="flex flex-wrap items-center gap-1">
                {Array.from({ length: Math.round(requiredHours / 8) }).map(
                  (_, index) => {
                    const isCompleted = index < Math.round(completedHours / 8);
                    return (
                      <div
                        key={index}
                        className={`w-4 h-4 rounded transition-colors ${
                          isCompleted
                            ? mounted && theme === "dark"
                              ? "bg-[#00472E]"
                              : "bg-[#00FF66]"
                            : "bg-accent"
                        }`}
                        title={`Day ${index + 1}${
                          isCompleted ? " - Completed" : " - Pending"
                        }`}
                      />
                    );
                  }
                )}
              </div>
              <div className="text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <div
                    className={`w-3 h-3 rounded ${
                      mounted && theme === "dark"
                        ? "bg-[#00472E]"
                        : "bg-[#00FF66]"
                    }`}
                  ></div>
                  Completed ({Math.round(completedHours / 8)} days)
                </span>
                <span className="inline-flex items-center gap-1 ml-3">
                  <div className="w-3 h-3 rounded bg-accent"></div>
                  Remaining (
                  {Math.round(requiredHours / 8) -
                    Math.round(completedHours / 8)}{" "}
                  days)
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md gap-2">
          <CardHeader className="gap-0">
            <CardTitle className="flex items-center gap-2">
              <History className="w-4 h-4" />
              Time Entry History
            </CardTitle>
            <CardDescription>
              View your time entry history here.
            </CardDescription>
            <Separator className="my-2" />
          </CardHeader>
          <CardContent>
            {loading && (
              <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
            )}
            {entryContext!.timeEntries.length === 0 && !loading ? (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  No time entries yet. Add your first entryValue using the form
                  above.
                </AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-4">
                {entryContext!.timeEntries.map((entryValue, index) => {
                  const totalInputHours = calculateEntryHours(
                    entryValue.time_in,
                    entryValue.time_out,
                    entryValue.break_time
                  );
                  const totalHours = totalInputHours;

                  return (
                    <EntriesCard
                      key={entryValue.id}
                      index={index}
                      entry={entryValue}
                      totalInputHours={totalInputHours}
                      totalHours={totalHours}
                    />
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      <footer className="p-3 mt-10 text-center">
        <div className="flex items-center justify-center gap-1">
          <p className="text-sm">
            Redesigned by{" "}
            <span>
              <a
                className="hover:underline text-primary"
                href="https://johnallen.is-a.dev/"
                target="_blank"
              >
                dazedmind
              </a>
            </span>
          </p>
          <p className="text-sm">
            Built by{" "}
            <span>
              <a
                className="hover:underline text-primary"
                href="https://aybangueco.vercel.app/"
              >
                aybangueco
              </a>
            </span>
          </p>
        </div>
      </footer>
    </div>
  );
}
