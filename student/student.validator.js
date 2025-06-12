/**
 * Validates student input before saving to the database.
 * Ensures all required fields are present and properly formatted.
 * Throws an error containing validation messages if any rule is violated.
 *
 * @function ValidateStudentInput
 * @param {Object} student_input - The input data for a student.
 * @param {string} student_input.first_name - Required. Student's first name. Must be a string.
 * @param {string} student_input.last_name - Required. Student's last name. Must be a string.
 * @param {string} student_input.civility - Required. Must be one of: "Mr", "Mrs".
 * @param {string} student_input.postal_code_of_birth - Required. Must be a string.
 * @param {string} student_input.mobile_phone - Required. Maximum 12 characters.
 * @param {Array<Object>} student_input.address - Required. At least one address object.
 * Each address must include `street`, `city`, `province`, and `postal_code`.
 * @param {string} [student_input.date_of_birth] - Optional. Must be a valid date string if provided.
 * @param {string} student_input.school_id - Required. Must be a string representing the school ID.
 * @param {string} student_input.email - Required. Must be a valid email address.
 *
 * @throws {Error} Throws an error if any validation rule fails, with a message listing all issues.
 */

function ValidateStudentInput(student_input) {
  // *************** Variable to contain error
  const error = [];

  // *************** validate student first_name
  if (
    !student_input.first_name || typeof student_input.first_name !== "string"
  ) {
    error.push("first name is required and must be string");
  }

  // *************** validate student last_name
  if (!student_input.last_name || typeof student_input.last_name !== "string") {
    error.push("last name is required and must be string");
  }

  // *************** validate student civility
  const civilities = ["Mr", "Mrs"];
  if (!student_input.civility || !civilities.includes(student_input.civility)) {
    error.push(`Civility must be one of: ${civilities.join(", ")}`);
  }

  // *************** validate student postal_code_of_birth
  if (
    !student_input.postal_code_of_birth ||
    typeof student_input.postal_code_of_birth !== "string"
  ) {
    error.push("postal code of birth is required and must be string");
  }

  // *************** validate user mobile_phone
  if (!student_input.mobile_phone || student_input.mobile_phone.length > 12) {
    error.push("Mobile phone is required and must not exceed 12 characters.");
  }

  // *************** validate student address
  if (
    !Array.isArray(student_input.address) ||
    student_input.address.length === 0
  ) {
    error.push("At least one address is required.");
  } else {
    student_input.address.forEach((addr, idx) => {
      if (!addr.street || !addr.city || !addr.province || !addr.postal_code) {
        error.push(`Address at index ${idx} is missing required fields.`);
      }
    });
  }

  // *************** validate date_of_birth
  if (student_input.date_of_birth) {
    const date = new Date(student_input.date_of_birth);
    if (isNaN(date.getTime())) {
      error.push("Date of birth must be a valid date.");
    }
  }

  // *************** validate school_id
  if (!student_input.school_id || typeof student_input.school_id !== "string") {
    error.push("School ID is required and must be a string.");
  }

  // *************** validate student email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!student_input.email || !emailRegex.test(student_input.email)) {
    error.push("A valid email is required.");
  }

  // *************** checking if there's error message
  if (error.length > 0) {
    throw new Error(error.join(" "));
  }
}

// *************** EXPORT MODULE ***************
module.exports = { ValidateStudentInput };
