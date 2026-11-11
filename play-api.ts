import { supabase } from "./auth";
import { timedRequest } from "./abort-utils";

export const playErrorMessage = (error: unknown) => error instanceof Error ? error.message : "Online Play could not connect. Try again.";

export class PlayRequestError extends Error {
  constructor(message: string, readonly retryable: boolean, readonly needsJoin = false) { super(message); }
}

export async function callPlay<T>(name: string, args: Record<string, unknown> = {}, signal?: AbortSignal): Promise<T> {
  if (!supabase) throw new PlayRequestError("Online Play needs a database connection.", false);
  const request = timedRequest(signal, 9000);
  try {
    const { data, error } = await supabase.rpc(name, args).abortSignal(request.signal);
    if (error?.code === "P0001" || error?.code === "42501") {
      throw new PlayRequestError(error.message, false, error.code === "42501" && name === "play_room");
    }
    if (error) throw new PlayRequestError("Online Play could not connect. Try again.", true);
    return data as T;
  } finally {
    request.dispose();
  }
}
