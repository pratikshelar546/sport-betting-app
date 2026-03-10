export const formatDate = (date:string) => {
    const d = new Date(date)
  
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, "0")
    const day = String(d.getDate()).padStart(2, "0")
  
    const hours = String(d.getHours()).padStart(2, "0")
    const minutes = String(d.getMinutes()).padStart(2, "0")
  
    return `${year}-${month}-${day} ${hours}:${minutes}`
  }

/**
 * Parses a date string to a Date object. Handles:
 * - "YYYY-MM-DD HH:mm" (frontend format) - treats as IST
 * - "YYYY-MM-DDTHH:mm:ss+05:30" (broker API format)
 */
export const parseToDate = (value: string | Date): Date => {
  if (value instanceof Date) return value
  const s = String(value).trim()
  // Already has timezone (T or Z or +05:30 etc) - parse directly
  if (s.includes("T") || s.endsWith("Z") || /[+-]\d{2}:\d{2}$/.test(s)) {
    return new Date(s)
  }
  // "2026-02-05 09:15" -> "2026-02-05T09:15:00+05:30" (IST for NSE)
  const normalized = s.replace(" ", "T")
  const withSeconds = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(normalized)
    ? normalized + ":00"
    : normalized
  const withTz = withSeconds + "+05:30"
  return new Date(withTz)
}