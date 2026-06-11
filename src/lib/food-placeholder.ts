const GRADIENTS = [
  "from-orange-400 to-amber-500",
  "from-amber-400 to-orange-600",
  "from-orange-300 to-rose-400",
  "from-yellow-400 to-orange-500",
  "from-orange-500 to-red-400",
  "from-amber-300 to-orange-400",
];

export function getFoodGradient(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  return GRADIENTS[Math.abs(hash) % GRADIENTS.length];
}
