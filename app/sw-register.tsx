"use client";
import { useEffect } from "react";

export function SwRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      const swPath = `${process.env.NEXT_PUBLIC_BASE_PATH || ""}/sw.js`;
      navigator.serviceWorker.register(swPath).catch(() => {});
    }
  }, []);
  return null;
}
