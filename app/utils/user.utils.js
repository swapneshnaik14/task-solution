// Function to parse a CSV row and map it to an object based on headers
function parseCSVRow(row, headers) {
    // Split row into columns and trim spaces
    const columns = row.split(",").map((column) => column.trim());
    const obj = {};  // Resulting object
    let errors = []; // List of validation errors

    // Check if column count matches header count
    if (columns.length !== headers.length) {
      errors.push(
        `Mismatch in number of columns. Expected ${headers.length} but got ${columns.length}.`
      );
      return { obj, errors };
    }

    // Iterate over headers to map values
    headers.forEach((header, index) => {
      let value = columns[index] || "";  // Get value for current column

      // Handle nested object structure if header contains a dot
      if (header.includes(".")) {
        const keys = header.split(".");
        let currentObj = obj;
        for (let j = 0; j < keys.length - 1; j++) {
          if (!currentObj[keys[j]]) {
            currentObj[keys[j]] = {}; // Create nested object if needed
          }
          currentObj = currentObj[keys[j]];
        }
        currentObj[keys[keys.length - 1]] = value;
      } else {
        obj[header] = value;
      }

      // Custom validation checks
      if (header === "name.firstName" && !value) errors.push("First name is required.");
      if (header === "name.lastName" && !value) errors.push("Last name is required.");
      if (header === "age") {
        const age = parseInt(value, 10);
        if (isNaN(age)) {
          errors.push("Age must be a valid integer.");
        } else {
          obj[header] = age;
        }
      }
    });

    return { obj, errors };  // Return parsed object and any errors
}

module.exports = { parseCSVRow };
