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
    // Parse the date string (expects ISO format from API)
    const date = new Date(dateStr);
    
    // Check if the date is valid
    if (isNaN(date.getTime())) {
      return "";
    }
    
    // Format the date as short date in pt-BR locale
    return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" }).format(date);
  } catch (e) {
    // Catch any unexpected errors
    return "";
  }
};

// Test cases that were causing the original error
console.log("Testing formatDate function:");
console.log("1. null:", `"${formatDate(null)}"`);
console.log("2. undefined:", `"${formatDate(undefined)}"`);
console.log("3. empty string:", `"${formatDate("")}"`);
console.log("4. invalid ISO string 2024-13-22:", `"${formatDate("2024-13-22")}"`);
console.log("5. invalid ISO string 2024-02-30:", `"${formatDate("2024-02-30")}"`);
console.log("6. valid ISO string 2024-08-22:", `"${formatDate("2024-08-22")}"`);
console.log("7. valid ISO string with time 2024-08-22T10:30:00Z:", `"${formatDate("2024-08-22T10:30:00Z")}"`);
console.log("8. invalid string abc:", `"${formatDate("abc")}"`);
console.log("9. empty object:", `"${formatDate({})}"`);
console.log("10. number 123:", `"${formatDate(123)}"`);