import { useEffect, useRef, useState, useCallback } from "react";
import { seoApi } from "../api";
import { apiErrorMessage } from "../api";
import type { TaskState, TaskStatusResponse } from "../types";

interface TaskPollingState<T> {
  taskId: string | null;
  status: TaskState | null;
  progress: { stage?: string; [key: string]: unknown } | null;
  result: T | null;
  error: string | null;
  /** True while a task is enqueued or running. */
  loading: boolean;
}

interface UseTaskPollingOptions {
  intervalMs?: number;
  /** Stop polling after N ticks (safety net). Default: ~5 minutes at 2s. */
  maxTicks?: number;
}

/** Poll /tasks/{id} until it reaches a terminal state. */
export function useTaskPolling<T = Record<string, unknown>>(
  options: UseTaskPollingOptions = {}
) {
  const { intervalMs = 2000, maxTicks = 150 } = options;

  const [state, setState] = useState<TaskPollingState<T>>({
    taskId: null,
    status: null,
    progress: null,
    result: null,
    error: null,
    loading: false,
  });

  const timerRef = useRef<number | null>(null);
  const ticksRef = useRef(0);
  const cancelledRef = useRef(false);

  const stop = useCallback(() => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const reset = useCallback(() => {
    stop();
    cancelledRef.current = false;
    ticksRef.current = 0;
    setState({
      taskId: null,
      status: null,
      progress: null,
      result: null,
      error: null,
      loading: false,
    });
  }, [stop]);

  const pollOnce = useCallback(
    async (taskId: string) => {
      try {
        const res: TaskStatusResponse<T> = await seoApi.getTaskStatus<T>(taskId);
        if (cancelledRef.current) return;

        setState((prev) => ({
          ...prev,
          status: res.status,
          progress: res.progress ?? null,
        }));

        if (res.status === "SUCCESS") {
          setState((prev) => ({
            ...prev,
            result: (res.result as T) ?? null,
            loading: false,
          }));
          stop();
          return;
        }
        if (
          res.status === "FAILURE" ||
          res.status === "REVOKED"
        ) {
          setState((prev) => ({
            ...prev,
            error: res.error ?? "Task failed",
            loading: false,
          }));
          stop();
          return;
        }

        ticksRef.current += 1;
        if (ticksRef.current >= maxTicks) {
          setState((prev) => ({
            ...prev,
            error: "Timed out waiting for task to complete.",
            loading: false,
          }));
          stop();
          return;
        }
        timerRef.current = window.setTimeout(
          () => pollOnce(taskId),
          intervalMs
        );
      } catch (err) {
        if (cancelledRef.current) return;
        setState((prev) => ({
          ...prev,
          error: apiErrorMessage(err, "Polling failed"),
          loading: false,
        }));
        stop();
      }
    },
    [intervalMs, maxTicks, stop]
  );

  const start = useCallback(
    (taskId: string) => {
      stop();
      cancelledRef.current = false;
      ticksRef.current = 0;
      setState({
        taskId,
        status: "PENDING",
        progress: null,
        result: null,
        error: null,
        loading: true,
      });
      // small head-start delay to avoid hitting the backend before the task is enqueued
      timerRef.current = window.setTimeout(() => pollOnce(taskId), 500);
    },
    [pollOnce, stop]
  );

  const cancel = useCallback(
    async (alsoRevokeOnServer = true) => {
      cancelledRef.current = true;
      stop();
      const id = state.taskId;
      if (alsoRevokeOnServer && id) {
        try {
          await seoApi.cancelTask(id);
        } catch {
          /* ignore */
        }
      }
      setState((prev) => ({ ...prev, loading: false, status: "REVOKED" }));
    },
    [state.taskId, stop]
  );

  useEffect(() => {
    return () => {
      cancelledRef.current = true;
      stop();
    };
  }, [stop]);

  return { ...state, start, cancel, reset };
}
