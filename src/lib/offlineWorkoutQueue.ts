/**
 * Local-First Offline Workout Queue for Powerlifters and Athletes
 * Saves workout sessions locally when training in basements with poor cellular signal,
 * and synchronizes with the server as soon as the device reconnects.
 */

export interface OfflineWorkoutSession {
  id: string;
  day: string;
  tier: string;
  phase?: string | null;
  focus: string;
  setsReps: string;
  exercises: string[];
  completedExercises: string[];
  durationMinutes?: number | null;
  completedAt: string;
  createdAt: string;
}

const OFFLINE_QUEUE_KEY = "fitflow_offline_workout_queue_v1";
let memoryQueueStore: Record<string, string> = {};

function getStorage(): {
  getItem: (key: string) => string | null;
  setItem: (key: string, val: string) => void;
  removeItem: (key: string) => void;
} {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      return window.localStorage;
    }
    if (typeof globalThis !== "undefined" && (globalThis as any).localStorage) {
      return (globalThis as any).localStorage;
    }
  } catch {
    // Fallback to in-memory store
  }

  return {
    getItem: (key: string) => memoryQueueStore[key] ?? null,
    setItem: (key: string, val: string) => {
      memoryQueueStore[key] = val;
    },
    removeItem: (key: string) => {
      delete memoryQueueStore[key];
    },
  };
}

/**
 * Retrieves all pending offline workout sessions from storage
 */
export function getQueuedOfflineWorkouts(): OfflineWorkoutSession[] {
  try {
    const raw = getStorage().getItem(OFFLINE_QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Adds a completed workout session to the offline sync queue
 */
export function enqueueOfflineWorkout(session: Omit<OfflineWorkoutSession, "id" | "createdAt">): OfflineWorkoutSession {
  const item: OfflineWorkoutSession = {
    ...session,
    id: `offline-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    createdAt: new Date().toISOString(),
  };

  try {
    const storage = getStorage();
    const existing = getQueuedOfflineWorkouts();
    existing.push(item);
    storage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(existing));
  } catch {
    // Storage quota or disabled fallback
  }

  return item;
}

/**
 * Clears the offline queue (e.g. after successful sync)
 */
export function clearQueuedOfflineWorkouts(): void {
  try {
    getStorage().removeItem(OFFLINE_QUEUE_KEY);
  } catch {
    // Ignore storage clear error
  }
}

/**
 * Attempts to flush and post all queued offline workout sessions to the API
 */
export async function syncQueuedWorkouts(
  endpoint: string = "/api/workout-sessions",
): Promise<{ syncedCount: number; errors: number }> {
  if (typeof navigator !== "undefined" && navigator.onLine === false) {
    return { syncedCount: 0, errors: 0 };
  }

  const queue = getQueuedOfflineWorkouts();
  if (queue.length === 0) return { syncedCount: 0, errors: 0 };

  const remaining: OfflineWorkoutSession[] = [];
  let syncedCount = 0;
  let errors = 0;

  for (const session of queue) {
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(session),
      });

      if (res.ok) {
        syncedCount++;
      } else {
        errors++;
        remaining.push(session);
      }
    } catch {
      errors++;
      remaining.push(session);
    }
  }

  try {
    const storage = getStorage();
    if (remaining.length === 0) {
      storage.removeItem(OFFLINE_QUEUE_KEY);
    } else {
      storage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(remaining));
    }
  } catch {
    // Ignore storage update errors
  }

  return { syncedCount, errors };
}
