"use client";

import { useEffect, useState } from "react";
import { Icons } from "@/components/icons";

export type AlertType = "success" | "error";

interface Alert {
  id: string;
  message: string;
  type: AlertType;
}

let alertCount = 0;

export function useAlert() {
  const [alerts, setAlerts] = useState<Alert[]>([]);

  const addAlert = (message: string, type: AlertType) => {
    const id = `alert-${alertCount++}`;
    const newAlert: Alert = { id, message, type };

    setAlerts((prev) => [...prev, newAlert]);

    // Auto-dismiss after 3 seconds
    setTimeout(() => {
      setAlerts((prev) => prev.filter((a) => a.id !== id));
    }, 5000);
  };

  const success = (message: string) => addAlert(message, "success");
  const error = (message: string) => addAlert(message, "error");

  return { alerts, success, error };
}

export function AlertContainer({ alerts }: { alerts: Alert[] }) {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
      {alerts.map((alert) => (
        <div
          key={alert.id}
          className={`
            flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg
            animate-in slide-in-from-right-full fade-in
            transition-all duration-300
            ${alert.type === "success"
              ? "bg-green-600 text-white"
              : "bg-red-600 text-white"
            }
          `}
        >
          {alert.type === "success" ? (
            <Icons.CheckCircle className="w-5 h-5 shrink-0" />
          ) : (
            <Icons.AlertCircle className="w-5 h-5 shrink-0" />
          )}
          <span className="text-sm font-medium">{alert.message}</span>
        </div>
      ))}
    </div>
  );
}
