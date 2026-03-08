export function maskEmail(email: string): string {
  const atIndex = email.indexOf("@")
  if (atIndex < 2) return `*@${email.slice(atIndex + 1)}`
  return `${email.slice(0, 2)}***@${email.slice(atIndex + 1)}`
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

export const CATEGORY_LABELS: Record<string, string> = {
  viagem: "Travel",
  aniversario: "Birthday",
  casamento: "Wedding",
  formatura: "Graduation",
  festa: "Party",
  bebe: "Baby",
  show: "Concert",
  conquista: "Achievement",
  evento: "Event",
  outro: "Other",
}

export const CATEGORY_COLORS = [
  "#818cf8",
  "#34d399",
  "#fb923c",
  "#f472b6",
  "#a78bfa",
  "#22d3ee",
  "#facc15",
  "#4ade80",
  "#f87171",
  "#94a3b8",
]
