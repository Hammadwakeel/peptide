import type { ApplicationWizardState } from "@/lib/apply/types";

export async function mockSubmitApplication(_state: ApplicationWizardState) {
  await new Promise((resolve) => setTimeout(resolve, 900));
}

export async function mockUploadFile(
  onProgress: (progress: number) => void,
): Promise<void> {
  for (let i = 1; i <= 10; i += 1) {
    await new Promise((resolve) => setTimeout(resolve, 80));
    onProgress(i * 10);
  }
}

export async function mockPlaidConnect(): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 700));
}

export async function mockESign(): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 800));
}
