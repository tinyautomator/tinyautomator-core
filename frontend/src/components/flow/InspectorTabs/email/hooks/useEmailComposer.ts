"use client";

import { useState } from "react";

export function useEmailComposer() {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [template, setTemplate] = useState("custom");

  return {
    subject,
    setSubject,
    body,
    setBody,
    template,
    setTemplate,
  };
}
