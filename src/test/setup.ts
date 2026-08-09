import { vi } from "vitest";

// unstable_cache kräver Next.js inkrementella cache, som bara finns i en
// serverkörning. I testerna körs den underliggande funktionen direkt.
vi.mock("next/cache", () => ({
  unstable_cache: <Args extends unknown[], Result>(callback: (...args: Args) => Result) => callback,
  revalidateTag: vi.fn(),
  revalidatePath: vi.fn(),
}));
