import { InventoryItem } from "./types"

export const parseDate = (dateStr: string) => {
  const parts = dateStr.split("/")
  if (parts.length === 3) {
    const day = Number.parseInt(parts[0])
    const month = Number.parseInt(parts[1]) - 1 // Month is 0-indexed
    const year = Number.parseInt(parts[2])
    return new Date(year, month, day)
  }
  return null
}

export const hasMissingData = (item: InventoryItem) => {
  return !item.price || !item.grade
}

export const getUniqueValues = (data: InventoryItem[], field: keyof InventoryItem) => {
  return [...new Set(data.map((item) => item[field]))].filter(Boolean) as string[]
}