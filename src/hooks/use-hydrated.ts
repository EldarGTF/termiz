"use client";

import { useEffect, useState } from "react";

/** True only after client mount — avoids SSR/client mismatch with persisted state. */
export function useHydrated() {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  return hydrated;
}
