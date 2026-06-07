import { ApiError, getErrorMessage } from "@/lib/api/errors";
import { toast } from "@/lib/toast";

type ApiClientOptions = RequestInit & {
  skipErrorToast?: boolean;
};

export async function apiClient<T>(
  input: string,
  options: ApiClientOptions = {},
): Promise<T> {
  const { skipErrorToast = false, ...init } = options;

  try {
    const response = await fetch(input, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...init.headers,
      },
    });

    const payload = await response.json().catch(() => null);

    if (!response.ok) {
      const message =
        payload && typeof payload === "object" && "message" in payload
          ? String(payload.message)
          : response.statusText || "Request failed";

      throw new ApiError(response.status, message);
    }

    return payload as T;
  } catch (error) {
    if (!skipErrorToast) {
      toast.error(getErrorMessage(error));
    }
    throw error;
  }
}
