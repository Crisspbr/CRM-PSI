const formatDate = (dateStr) => {
  if (!dateStr) return ""
  try {
    // Check if it matches YYYY-MM-DD format first
    const parts = dateStr.split('-')
    if (parts.length !== 3) return ""
    
    const [yearStr, monthStr, dayStr] = parts
    const year = parseInt(yearStr, 10)
    const month = parseInt(monthStr, 10)
    const day = parseInt(dayStr, 10)
    
    // Validate ranges
    if (Number.isNaN(year) || Number.isNaN(month) || Number.isNaN(day)) return ""
    if (year < 1000 || year > 9999) return ""
    if (month < 1 || month > 12) return ""
    if (day < 1 || day > 31) return ""
    
    // Additional validation for days in month
    const date = new Date(year, month - 1, day)
    if (date.getFullYear() !== year || date.getMonth() + 1 !== month || date.getDate() !== day) {
      return ""
    }
    
    return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" }).format(date)
  } catch (e) {
    return ""
  }
}

// Test cases
console.log("Testing formatDate function:")
console.log("1. Empty string:", `"${formatDate("")}"`)
console.log("2. Null:", `"${formatDate(null)}"`)
console.log("3. Undefined:", `"${formatDate(undefined)}"`)
console.log("4. Valid date 2024-08-22:", `"${formatDate("2024-08-22")}"`)
console.log("5. Invalid month 2024-13-22:", `"${formatDate("2024-13-22")}"`)
console.log("6. Invalid day 2024-02-30:", `"${formatDate("2024-02-30")}"`)
console.log("7. Wrong format 2024/08/22:", `"${formatDate("2024/08/22")}"`)
console.log("8. Non-date string abc:", `"${formatDate("abc")}"`)
console.log("9. Just year 2024:", `"${formatDate("2024")}"`)
console.log("10. Year-month 2024-08:", `"${formatDate("2024-08")}"`)
console.log("11. Invalid day 2024-04-31:", `"${formatDate("2024-04-31")}"`)
console.log("12. Valid leap year 2024-02-29:", `"${formatDate("2024-02-29")}"`)
console.log("13. Invalid leap year 2023-02-29:", `"${formatDate("2023-02-29")}"`)