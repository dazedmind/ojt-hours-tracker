"use client";

import React, { useState, useEffect, useContext, useRef } from "react";
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
  Check,
  FlagTriangleLeft,
  History,
  Hourglass,
  Pencil,
  Share,
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
import html2canvas from "html2canvas";

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
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState<boolean>(false);
  const { user, userLoading } = useAuthUser();
  const { theme } = useTheme();
  const blockViewRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const completionPercentage: number =
    requiredHours === 0
      ? 0
      : Math.min(Math.round((completedHours / requiredHours) * 100), 100);

  useEffect(() => {
    setMounted(true);
    // Initialize localStorage only on client side
    if (typeof window !== "undefined") {
      if (!localStorage.getItem("hours")) {
        localStorage.setItem("hours", "0");
      }
      const hours = Number(localStorage.getItem("hours")) || 0;
      setRequiredHours(hours);
      console.log("Component mounted. Required hours from localStorage:", hours);
    }
  }, []);

  useEffect(() => {
    async function fetchEntries() {
      console.log("Fetch entries called", { 
        hasUser: !!user?.id, 
        userLoading, 
        hasContext: !!entryContext 
      });

      if (userLoading) {
        console.log("User still loading, waiting...");
        return;
      }

      if (!user?.id) {
        console.log("No user ID - user not authenticated");
        setLoading(false);
        return;
      }

      if (!entryContext) {
        console.log("No entry context available");
        setLoading(false);
        return;
      }

      console.log("Fetching entries for user:", user.id);
      
      try {
        const { ok, data } = await actionGetEntries(user.id);

        console.log("Fetch result:", { ok, dataLength: data?.length, data });

        if (!ok) {
          console.error("Failed to fetch entries");
          toast.error("Error fetching entries");
          setLoading(false);
          return;
        }

        if (!data) {
          console.warn("No data returned from fetch");
          toast.error("No data returned");
          setLoading(false);
          entryContext.setTimeEntries([]);
          return;
        }

        console.log("Setting entries:", data);
        entryContext.setTimeEntries(data);
        setLoading(false);
        console.log("Entries set successfully:", data.length);
      } catch (error) {
        console.error("Error in fetchEntries:", error);
        toast.error("Failed to fetch entries");
        setLoading(false);
      }
    }

    fetchEntries();
  }, [user?.id, userLoading, entryContext]);

  useEffect(() => {
    if (!entryContext?.timeEntries) {
      console.log("No entries to calculate");
      setCompletedHours(0);
      return;
    }

    let totalHours = 0;

    console.log("Calculating hours for entries:", entryContext.timeEntries);

    entryContext.timeEntries.forEach((entryValue) => {
      const totalInputHours = calculateEntryHours(
        entryValue.time_in,
        entryValue.time_out,
        entryValue.break_time
      );

      console.log("Entry hours:", {
        date: entryValue.date,
        time_in: entryValue.time_in,
        time_out: entryValue.time_out,
        break_time: entryValue.break_time,
        calculated: totalInputHours
      });

      totalHours += totalInputHours;
    });

    const completed = parseFloat(totalHours.toFixed(2));
    setCompletedHours(completed);
    console.log("Total completed hours:", completed, "from", entryContext.timeEntries.length, "entries");
  }, [entryContext?.timeEntries]);

  const handleRequiredHoursChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ): void => {
    const value = parseInt(e.target.value) || 0;
    if (typeof window !== "undefined") {
      localStorage.setItem("hours", value.toString());
    }
    setRequiredHours(value);
  };

  const handleAddEntry = async () => {
    if (!entryValue.date) {
      alert("Please select a date");
      return;
    }

    if (!user?.id) {
      toast.error("User not authenticated");
      return;
    }

    if (!entryContext) {
      toast.error("Context not available");
      return;
    }

    setIsSubmitting(true);

    const { ok, data } = await actionCreateEntry(user.id, {
      date: new Date(entryValue.date).toLocaleDateString(),
      time_in: entryValue.time_in,
      time_out: entryValue.time_out,
      break_time: entryValue.break_time,
    });

    console.log("Data: ", data);
    if (!ok) {
      toast.error("Error creating entry");
      setIsSubmitting(false);
      return;
    }

    if (!data) {
      toast.error("No data ent");
      setIsSubmitting(false);
      return;
    }

    entryContext.setTimeEntries((prev) => [
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

  const handleShareBlockView = async () => {
    if (!blockViewRef.current) {
      toast.error("Block view not found");
      return;
    }

    setIsGeneratingImage(true);
    toast.loading("Generating story image...", { id: "generating" });

    try {
      // Hide the header temporarily
      if (headerRef.current) {
        headerRef.current.style.display = "none";
      }

      // Wait for DOM to update
      await new Promise(resolve => setTimeout(resolve, 100));

      // Capture the block view card
      const canvas = await html2canvas(blockViewRef.current, {
        backgroundColor: theme === "dark" ? "#121212" : "#ffffff",
        scale: 2,
        logging: false,
        useCORS: true,
      } as any);

      // Show the header again
      if (headerRef.current) {
        headerRef.current.style.display = "flex";
      }

      // Create a 9:16 canvas (1080x1920 - Instagram/Facebook story size)
      const storyCanvas = document.createElement("canvas");
      const storyWidth = 1080;
      const storyHeight = 1920;
      storyCanvas.width = storyWidth;
      storyCanvas.height = storyHeight;

      const ctx = storyCanvas.getContext("2d");
      if (!ctx) {
        throw new Error("Could not get canvas context");
      }

      // Fill background
      ctx.fillStyle = theme === "dark" ? "#121212" : "#ffffff";
      ctx.fillRect(0, 0, storyWidth, storyHeight);

      // Colors
      const textColor = theme === "dark" ? "#fafafa" : "#0a0a0a";
      const accentColor = theme === "dark" ? "#00bd7c" : "#00bd7c";

      // Draw clock icon (circle with clock hands)
      const iconSize = 80;
      const iconX = storyWidth / 2;
      const iconY = 350;
      
      // Draw circle
      ctx.strokeStyle = accentColor;
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.arc(iconX, iconY, iconSize / 2, 0, 2 * Math.PI);
      ctx.stroke();
      
      // Draw clock hands
      ctx.strokeStyle = accentColor;
      ctx.lineWidth = 4;
      ctx.lineCap = "round";
      // Hour hand
      ctx.beginPath();
      ctx.moveTo(iconX, iconY);
      ctx.lineTo(iconX, iconY - 15);
      ctx.stroke();
      // Minute hand
      ctx.beginPath();
      ctx.moveTo(iconX, iconY);
      ctx.lineTo(iconX + 20, iconY);
      ctx.stroke();

      // Draw hours text
      ctx.font = "bold 72px sans-serif";
      ctx.fillStyle = textColor;
      ctx.textAlign = "center";
      ctx.fillText(`${completedHours} Hours`, storyWidth / 2, 480);

      // Draw days completed text
      ctx.font = "36px sans-serif";
      const completedDays = Math.round(completedHours / 8);
      const totalDays = Math.round(requiredHours / 8);
      ctx.fillStyle = accentColor;
      // ctx.fillText(`${completedDays}`, storyWidth / 2, 460);
      ctx.fillStyle = textColor;
      ctx.textAlign = "center";
      ctx.fillText(` ${completedDays} / ${totalDays} days completed`, storyWidth / 2, 560);

      // Calculate block view card position
      const cardPadding = 80;
      const cardWidth = storyWidth - (cardPadding * 2);
      const scaleFactor = cardWidth / canvas.width;
      const scaledCardWidth = canvas.width * scaleFactor;
      const scaledCardHeight = canvas.height * scaleFactor;
      const cardX = (storyWidth - scaledCardWidth) / 2;
      const cardY = 750;

      // Draw the captured block view card
      ctx.drawImage(canvas, cardX, cardY, scaledCardWidth, scaledCardHeight);

      // Add branding text at the bottom
      ctx.font = "bold 52px sans-serif";
      ctx.fillStyle = textColor;
      ctx.textAlign = "center";
      ctx.fillText("LockIn", storyWidth / 2, storyHeight - 150);
      
      ctx.font = "32px sans-serif";
      ctx.fillStyle = textColor;
      ctx.fillText("lockin-tracker.vercel.app", storyWidth / 2, storyHeight - 100);

      // Convert to blob and download
      storyCanvas.toBlob((blob) => {
        if (!blob) {
          toast.error("Failed to generate image", { id: "generating" });
          setIsGeneratingImage(false);
          return;
        }

        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.download = `lockin-progress-${new Date().getTime()}.png`;
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);

        toast.success("Story image downloaded!", { id: "generating" });
        setIsGeneratingImage(false);
      }, "image/png");
    } catch (error) {
      console.error("Error generating image:", error);
      toast.error("Failed to generate image", { id: "generating" });
      setIsGeneratingImage(false);
      
      if (headerRef.current) {
        headerRef.current.style.display = "flex";
      }
    }
  };

  return (
    <div className="container mx-auto max-w-4xl px-4">
      <header>
        <NavBar />
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card className="shadow-md">
          <CardHeader className="gap-0">
            <CardTitle className="flex items-center gap-2">
              <FlagTriangleLeft className="w-4 h-4" />
              OJT Progress
            </CardTitle>
            <CardDescription>View your OJT progress here.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center">
            {mounted ? (
              <>
                <div className="relative w-40 h-40">
                  <div
                    className="w-full h-full rounded-full"
                    style={{
                      background: `conic-gradient(
                        ${
                          theme === "dark" ? "#00472E" : "#00FF66"
                        } ${completionPercentage}%,
                        ${
                          theme === "dark" ? "#232323" : "#e9e9e9"
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
              </>
            ) : (
              <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            )}
          </CardContent>
          <CardFooter>
            <div className="w-full space-y-2">
              <p className="text-sm">
                Remaining Hours: {requiredHours - completedHours}
              </p>
              <span className="flex items-center justify-between gap-2">
                <Label htmlFor="requiredHours">Total Required Hours:</Label>
                <span className="flex items-center gap-2">
                  <Input
                    id="requiredHours"
                    type="text"
                    value={requiredHours}
                    onChange={handleRequiredHoursChange}
                    className="mt-1 w-14 text-center"
                    disabled={!isEditing}
                  />
                  {!isEditing && (
                    <button className="text-sm text-primary cursor-pointer" onClick={() => setIsEditing(true)}> <Pencil className="w-4 h-4" /> </button>
                  )}
                  {isEditing && (
                    <button className="text-sm text-primary cursor-pointer" onClick={() => setIsEditing(false)}> <Check className="w-4 h-4" /> </button>
                  )}
                </span>
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
        <Card ref={blockViewRef} data-card-ref="block-view">
          <CardHeader ref={headerRef} className="flex flex-row items-center justify-between">
            <span>
              <CardTitle className="flex items-center gap-2">
                <SquareActivity className="w-4 h-4" /> Block View
              </CardTitle>
              <CardDescription>
                View your time entry history in a block view.
              </CardDescription>
            </span>
            <button 
              className="flex items-center gap-2 text-sm text-primary cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleShareBlockView}
              disabled={isGeneratingImage}
            >
              {isGeneratingImage ? "Generating..." : "Share"} <Share className="w-4 h-4" />
            </button>
          </CardHeader>
          <CardContent>
            {mounted ? (
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
                              ? theme === "dark"
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
                        theme === "dark"
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
            ) : (
              <div className="flex justify-center py-8">
                <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              </div>
            )}
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
            {!loading && (!entryContext || entryContext.timeEntries.length === 0) ? (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  No time entries yet. Add your first entryValue using the form
                  above.
                </AlertDescription>
              </Alert>
            ) : (
              !loading && entryContext && (
                <div className="space-y-4">
                  {entryContext.timeEntries.map((entryValue, index) => {
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
              )
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
