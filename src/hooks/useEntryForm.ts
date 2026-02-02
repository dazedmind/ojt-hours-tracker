import { NewTimeEntry } from "@/utils/types";
import { useState } from "react";

export default function useEntryForm() {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const [entryValue, setEntryValue] = useState<NewTimeEntry>({
    date: "",
    time_in: "",
    time_out: "",
    break_time: "",
    note: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setEntryValue((prev) => ({ ...prev, [name]: value }));
  };

  return {
    isSubmitting,
    setIsSubmitting,
    entryValue,
    setEntryValue,
    handleInputChange,
  };
}
