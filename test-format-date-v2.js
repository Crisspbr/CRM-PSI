const formatDate = (dateStr: unknown) => {
  if (dateStr == null || typeof dateStr !== 'string') {
    return "";
  }
  if (dateStr.trim() === "") {
    return "";
  }
  try {
    const datePart = dateStr.split('T')[0];
    const parts = datePart.split('-');
    if (parts.length !== 3) return "";
    const [yearStr, monthStr, dayStr] = parts;
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10);
    const day = parseInt(dayStr, 10);
    if (isNaN(year) || isNaN(month) || isNaN(day)) return "";
    return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" }).format(new Date(year, month - 1, day));
  } catch (e) {
    return "";
  }
};

// Test cases
console.log("Testing formatDate function:");
console.log("1. null:", `"${formatDate(null)}"`);
console.log("2. undefined:", `"${formatDate(undefined)}"`);
console.log("3. empty string:", `"${formatDate("")}"`);
console.log("4. whitespace only:", `"${formatDate("   ")}"`);
console.log("5. valid date 2024-08-22:", `"${formatDate("2024-08-22")}"`);
console.log("6. valid date with time 2024-08-22T10:30:00Z:", `"${formatDate("2024-08-22T10:30:00Z")}"`);
console.log("7. invalid month 2024-13-22:", `"${formatDate("2024-13-22")}"`);
console.log("8. invalid day 2024-02-30:", `"${formatDate("2024-02-30")}"`);
console.log("9. invalid string abc:", `"${formatDate("abc")}"`);
console.log("10. empty object:", `"${formatDate({})}"`);
console.log("11. number 123:", `"${formatDate(123)}"`);
console.log("12. array:", `"${formatDate([])}"`);
console.log("13. valid leap year 2024-02-29:", `"${formatDate("2024-02-29")}"`);
console.log("14. invalid leap year 2023-02-29:", `"${formatDate("2023-02-29")}"`);