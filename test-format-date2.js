const formatDate = (dateStr) => {
  // Handle null, undefined, non-string values
  if (dateStr == null || typeof dateStr !== 'string') {
    return "";
  }
  
  // Handle empty string
  if (dateStr.trim() === "") {
    return "";
  }
  
  try {
    // Check if it matches YYYY-MM-DD format first (with optional time)
    const parts = dateStr.split('-');
    if (parts.length < 3) return "";
    
    const [yearStr, monthStr, dayStrWithTime] = parts;
    
    // Extract just the date part from dayStrWithTime (could be "22" or "22T10:30:00.000Z" or "22 ")
    const dayStr = dayStrWithTime.split(/[T ]/)[0]; // Split on T or space and take first part
    
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10);
    const day = parseInt(dayStr, 10);
    
    // Validate that we actually got numbers
    if (isNaN(year) || isNaN(month) || isNaN(day)) {
      return "";
    }
    
    // Validate ranges
    if (year < 1000 || year > 9999) return "";
    if (month < 1 || month > 12) return "";
    if (day < 1 || day > 31) return "";
    
    // Additional validation for days in month
    const date = new Date(year, month - 1, day);
    if (date.getFullYear() !== year || date.getMonth() + 1 !== month || date.getDate() !== day) {
      return "";
    }
    
    return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" }).format(date);
  } catch (e) {
    // Catch any unexpected errors
    return "";
  }
}

// Test cases that would cause the original error
console.log("Testing formatDate function with various inputs:");
console.log("1. null:", `"${formatDate(null)}"`);
console.log("2. undefined:", `"${formatDate(undefined)}"`);
console.log("3. empty string:", `"${formatDate("")}"`);
console.log("4. whitespace only:", `"${formatDate("   ")}"`);
console.log("5. valid date 2024-08-22:", `"${formatDate("2024-08-22")}"`);
console.log("6. valid date with time 2024-08-22T10:30:00:", `"${formatDate("2024-08-22T10:30:00")}"`);
console.log("7. valid date with time and Z 2024-08-22T10:30:00.000Z:", `"${formatDate("2024-08-22T10:30:00.000Z")}"`);
console.log("8. invalid month 2024-13-22:", `"${formatDate("2024-13-22")}"`);
console.log("9. invalid day 2024-02-30:", `"${formatDate("2024-02-30")}"`);
console.log("10. wrong format 2024/08/22:", `"${formatDate("2024/08/22")}"`);
console.log("11. non-date string abc:", `"${formatDate("abc")}"`);
console.log("12. just year 2024:", `"${formatDate("2024")}"`);
console.log("13. year-month 2024-08:", `"${formatDate("2024-08")}"`);
console.log("14. invalid day april 31 2024-04-31:", `"${formatDate("2024-04-31")}"`);
console.log("15. valid leap year 2024-02-29:", `"${formatDate("2024-02-29")}"`);
console.log("16. invalid leap year 2023-02-29:", `"${formatDate("2023-02-29")}"`);
console.log("17. year 999 (too small):", `"${formatDate("0999-08-22")}"`);
console.log("18. year 10000 (too big):", `"${formatDate("10000-08-22")}"`);