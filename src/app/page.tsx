"use client";

import React, { useState, useEffect, useContext, useRef } from "react";
import { useRouter } from "next/navigation";
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
  ChevronLeft,
  ChevronRight,
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
  actionGetRequiredHours,
  actionSetRequiredHours,
  calculateEntryHours,
  EntriesCard,
  EntryContext,
  EntryForm,
} from "@/modules/entries";
import { actionCheckUserProfile } from "@/app/modules/users";
import { useTheme } from "next-themes";
import { Separator } from "@/components/ui/separator";
import NavBar from "./modules/layout/NavBar";
import toast from "react-hot-toast";
import html2canvas from "html2canvas";

export default function Home() {
  const router = useRouter();
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
  const [currentPage, setCurrentPage] = useState<number>(1);
  const entriesPerPage = 5;
  const { user, userLoading } = useAuthUser();
  const { theme } = useTheme();
  const blockViewRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const completionPercentage: number =
    requiredHours === 0
      ? 0
      : Math.min(Math.round((completedHours / requiredHours) * 100), 100);

  // Check if user needs onboarding
  useEffect(() => {
    async function checkOnboarding() {
      if (userLoading) return;
      
      const { ok, needsOnboarding } = await actionCheckUserProfile();
      
      if (ok && needsOnboarding) {
        router.push("/onboarding");
      }
    }

    checkOnboarding();
  }, [userLoading, router]);

  useEffect(() => {
    setMounted(true);
    // Initialize localStorage only on client side
    if (typeof window !== "undefined") {
      if (!localStorage.getItem("hours")) {
        localStorage.setItem("hours", "0");
      }
      const hours = Number(localStorage.getItem("hours")) || 0;
      setRequiredHours(hours);
    }
  }, []);

  useEffect(() => {
    async function fetchRequiredHours() {
      if (userLoading) {
        return;
      }
      const { ok, data } = await actionGetRequiredHours(user?.id || "");
      if (!ok) {
        console.error("Failed to fetch required hours");
        toast.error("Error fetching required hours");
        setLoading(false);
        return;
      }
      if (!data) {
        console.warn("No data returned from fetch");
        toast.error("Required hours not set");
        setLoading(false);
        return;
      }
      setRequiredHours(data.req_hours);
      console.log("Required hours set successfully:", data.req_hours);
    }
    fetchRequiredHours();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, userLoading]);


  useEffect(() => {
    async function fetchEntries() {
      if (userLoading) {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, userLoading]);

  useEffect(() => {
    if (!entryContext?.timeEntries) {
      console.log("No entries to calculate");
      setCompletedHours(0);
      return;
    }

    let totalHours = 0;

    entryContext.timeEntries.forEach((entryValue) => {
      const totalInputHours = calculateEntryHours(
        entryValue.time_in,
        entryValue.time_out,
        entryValue.break_time
      );

      totalHours += totalInputHours;
    });

    const completed = parseFloat(totalHours.toFixed(2));
    setCompletedHours(completed);

    // Reset to first page when entries change
    setCurrentPage(1);
  }, [entryContext?.timeEntries]);

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

  const handleSetRequiredHours = async () => {
    async function setRequiredHours() {
      if (!user?.id) {
        return;
      }
      const { ok, data } = await actionSetRequiredHours(user.id, requiredHours);
      if (!ok) {
        console.error("Failed to set required hours");
        toast.error("Error setting required hours");
        return;
      }
      if (!data) {
        console.warn("No data returned from set required hours");
        toast.error("No data returned");
        return;
      }
    }
    await setRequiredHours();

    setIsEditing(false);
  };

  const handleShareBlockView = async () => {
    if (!blockViewRef.current) {
      toast.error("Block view not found");
      return;
    }

    setIsGeneratingImage(true);
    toast.loading("Generating image...", { id: "generating" });

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
      const iconY = 300;
      
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

      ctx.font = "36px sans-serif";
      ctx.fillStyle = textColor;
      ctx.textAlign = "center";
      ctx.fillText(` Successfully Rendered`, storyWidth / 2, 400);


      // Draw hours text
      ctx.font = "bold 76px sans-serif";
      ctx.fillStyle = accentColor;
      ctx.textAlign = "center";
      ctx.fillText(`${completedHours} Hours`, storyWidth / 2, 490);

      // Draw days completed text
      ctx.font = "42px sans-serif";
      const completedDays = Math.round(completedHours / 8);
      const totalDays = Math.round(requiredHours / 8);
      ctx.fillStyle = accentColor;
      // ctx.fillText(`${completedDays}`, storyWidth / 2, 460);
      ctx.fillStyle = textColor;
      ctx.textAlign = "center";
      ctx.fillText(` ${completedDays} / ${totalDays} days completed 🎉`, storyWidth / 2, 560);

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

      // Load and draw logo above branding
      const logo = new Image();
      logo.src = "/lockin-logo.png";
      await new Promise((resolve) => {
        logo.onload = resolve;
      });

      // Draw logo centered above branding text
      const logoSize = 100;
      const logoX = (storyWidth - logoSize) / 2;
      const logoY = storyHeight - 280;
      ctx.drawImage(logo, logoX, logoY, logoSize, logoSize);

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

        toast.success("Generated share card!", { id: "generating" });
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
        <Card className="shadow-md flex justify-between">
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
                <div className="relative w-45 h-45">
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
                      <span className="text-md">Complete</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 w-full">
                  <Progress value={completionPercentage} className="h-2" />
                  <div className="flex justify-between text-sm mt-2">
                    <span>{completedHours || 0} hours completed</span>
                    <span>{requiredHours - completedHours || 0} hours remaining</span>
                  </div>
                </div>
              </>
            ) : (
              <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            )}
          </CardContent>
          {mounted && (
            <CardFooter>
              <div className="w-full space-y-2">
                {/* <p className="text-sm">
                  Remaining Hours: {Math.max(0, (requiredHours || 0) - (completedHours || 0))}
                </p> */}
                <span className="flex items-center justify-between gap-2">
                  <Label htmlFor="requiredHours">Total Required Hours:</Label>
                  <span className="flex items-center gap-2">
                    <Input
                      id="requiredHours"
                      type="text"
                      value={requiredHours || 0}
                      onChange={(e) => setRequiredHours(parseInt(e.target.value))}
                      className="mt-1 w-14 text-center"
                      disabled={!isEditing}
                    />
                    {!isEditing && (
                      <button className="text-sm text-primary cursor-pointer" onClick={() => setIsEditing(true)}> <Pencil className="w-4 h-4" /> </button>
                    )}
                    {isEditing && (
                      <button className="text-sm text-primary cursor-pointer" onClick={handleSetRequiredHours}> <Check className="w-4 h-4" /> </button>
                    )}
                  </span>
                </span>
              </div>
            </CardFooter>
          )}
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

      <div className="grid grid-cols-1 gap-6">
        <Card ref={blockViewRef} data-card-ref="block-view">
          <CardHeader ref={headerRef} className="flex flex-row items-center justify-between">
            <span>
              <CardTitle className="flex items-center gap-2">
                <SquareActivity className="w-4 h-4" /> Block View
              </CardTitle>
              <CardDescription>
                View time entry history in blocks.
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
                  {Math.round((requiredHours || 0) / 8)} days
                </div>
                <div className="flex flex-wrap items-center gap-1">
                  {Math.round((requiredHours || 0) / 8) > 0 ? (
                    Array.from({ length: Math.round((requiredHours || 0) / 8) }).map(
                      (_, index) => {
                        const isCompleted = index < Math.round((completedHours || 0) / 8);
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
                    )
                  ) : (
                    <p className="text-sm text-muted-foreground">Set required hours to see progress blocks</p>
                  )}
                </div>
                <div className="flex text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <div
                      className={`w-3 h-3 rounded ${
                        theme === "dark"
                          ? "bg-[#00472E]"
                          : "bg-[#00FF66]"
                      }`}
                    ></div>
                    <p>Completed ({Math.round((completedHours || 0) / 8)} days)</p>
                  </span>
                  <span className="flex items-center gap-1 ml-3">
                    <div className="w-3 h-3 rounded bg-accent"></div>
                    <p>Remaining ({Math.max(0, Math.round((requiredHours || 0) / 8) -
                      Math.round((completedHours || 0) / 8))}{" "}
                    days)</p>
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
              !loading && entryContext && (() => {
                // Sort entries by ID descending (most recent first)
                const sortedEntries = [...entryContext.timeEntries].sort((a, b) => b.id - a.id);
                
                // Calculate pagination
                const totalEntries = sortedEntries.length;
                const totalPages = Math.ceil(totalEntries / entriesPerPage);
                const startIndex = (currentPage - 1) * entriesPerPage;
                const endIndex = startIndex + entriesPerPage;
                const currentEntries = sortedEntries.slice(startIndex, endIndex);

                return (
                  <div className="space-y-4">
                    <div className="space-y-4">
                      {currentEntries.map((entryValue, index) => {
                        const totalInputHours = calculateEntryHours(
                          entryValue.time_in,
                          entryValue.time_out,
                          entryValue.break_time
                        );
                        const totalHours = totalInputHours;

                        return (
                          <EntriesCard
                            key={entryValue.id}
                            index={startIndex + index}
                            entry={entryValue}
                            totalInputHours={totalInputHours}
                            totalHours={totalHours}
                          />
                        );
                      })}
                    </div>

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                      <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4">
                        {/* <div className="text-sm text-muted-foreground">
                          Showing {startIndex + 1}-{Math.min(endIndex, totalEntries)} of {totalEntries} entries
                        </div> */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                            className="p-2 rounded-md border hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            aria-label="Previous page"
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </button>
                          
                          <div className="flex items-center gap-1">
                            {(() => {
                              const pages = [];
                              const maxVisible = 5;
                              
                              if (totalPages <= maxVisible) {
                                // Show all pages if total is small
                                for (let i = 1; i <= totalPages; i++) {
                                  pages.push(i);
                                }
                              } else {
                                // Show smart pagination with ellipsis
                                if (currentPage <= 3) {
                                  // Near start
                                  pages.push(1, 2, 3, 4, '...', totalPages);
                                } else if (currentPage >= totalPages - 2) {
                                  // Near end
                                  pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
                                } else {
                                  // In middle
                                  pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
                                }
                              }

                              return pages.map((page, idx) => {
                                if (page === '...') {
                                  return (
                                    <span key={`ellipsis-${idx}`} className="px-2 text-muted-foreground">
                                      ...
                                    </span>
                                  );
                                }
                                return (
                                  <button
                                    key={page}
                                    onClick={() => setCurrentPage(page as number)}
                                    className={`min-w-8 px-3 py-1 rounded-md text-sm transition-colors ${
                                      currentPage === page
                                        ? 'bg-primary text-primary-foreground'
                                        : 'hover:bg-accent'
                                    }`}
                                  >
                                    {page}
                                  </button>
                                );
                              });
                            })()}
                          </div>

                          <button
                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                            disabled={currentPage === totalPages}
                            className="p-2 rounded-md border hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            aria-label="Next page"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()
            )}
          </CardContent>
        </Card>
      </div>
      <footer className="p-3 py-6 mt-2 text-center">
        <div className="flex items-center justify-center gap-1">
          <p className="text-sm">
            Designed by{" "}
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
        </div>
      </footer>
    </div>
  );
}
