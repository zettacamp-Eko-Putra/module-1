// *************** IMPORT LIBRARY ***************
const { ApolloError } = require('apollo-server');

// *************** IMPORT VALIDATOR ***************
const {
  ValidateIdMongoose,
} = require('../../utilities/common-validator/mongo-validator.js');

/**
 * Utility function to validate input object for creating or updating a Student.
 *
 * This function ensures that:
 * - `first_name`, `last_name` must be strings and are required.
 * - `civility` must be one of: 'Mr', 'Mrs'.
 * - `postal_code_of_birth` must be a string and is required.
 * - `mobile_phone` must be present and not exceed 12 characters.
 * - `address` must be a non-empty array, and each address must contain valid `street`, `city`, `province`, and `postal_code`.
 * - `date_of_birth` must be a valid date if provided.
 * - `school_id` must be a valid MongoDB ObjectId.
 * - `email` must follow valid email format.
 *
 * @function ValidateStudentInput
 * @param {Object} studentInput - The input object for the student.
 * @param {string} studentInput.first_name - First name of the student.
 * @param {string} studentInput.last_name - Last name of the student.
 * @param {string} studentInput.civility - Civility title, either 'Mr' or 'Mrs'.
 * @param {string} studentInput.postal_code_of_birth - Postal code of student's birth location.
 * @param {string} studentInput.mobile_phone - Student's mobile phone number (max 12 characters).
 * @param {Array<Object>} studentInput.address - Array of address objects.
 * @param {string} studentInput.address[].street - Street name.
 * @param {string} studentInput.address[].city - City name.
 * @param {string} studentInput.address[].province - Province name.
 * @param {string} studentInput.address[].postal_code - Postal code.
 * @param {string} [studentInput.date_of_birth] - Optional date of birth (ISO string).
 * @param {string} studentInput.school_id - MongoDB ObjectId of the school.
 * @param {string} studentInput.email - Valid email address.
 *
 * @throws {ApolloError} If any required field is missing or invalid.
 */
function ValidateStudentInput(studentInput) {
  // *************** validate student first_name
  if (!studentInput.first_name || typeof studentInput.first_name !== 'string') {
    // *************** error message if the input not valid
    throw new ApolloError('first name is required and must be string');
  }

  // *************** validate student last_name
  if (!studentInput.last_name || typeof studentInput.last_name !== 'string') {
    // *************** error message if the input not valid
    throw new ApolloError('last name is required and must be string');
  }

  // *************** validate student civility
  const civilities = ['Mr', 'Mrs'];
  if (!studentInput.civility || !civilities.includes(studentInput.civility)) {
    // *************** error message if the input not valid
    throw new ApolloError(`Civility must be one of: ${civilities.join(', ')}`);
  }

  // *************** validate student postal_code_of_birth
  if (
    !studentInput.postal_code_of_birth ||
    typeof studentInput.postal_code_of_birth !== 'string'
  ) {
    // *************** error message if the input not valid
    throw new ApolloError(
      'postal code of birth is required and must be string'
    );
  }

  // *************** validate user mobile_phone
  if (!studentInput.mobile_phone || studentInput.mobile_phone.length > 12) {
    // *************** error message if the input not valid
    throw new ApolloError(
      'Mobile phone is required and must not exceed 12 characters.'
    );
  }

  // *************** validate student address
  if (!Array.isArray(studentInput.address) || !studentInput.address.length) {
    // *************** error message if the input not valid
    throw new ApolloError('Address is required.');
  }
  // *************** validate each address array
  studentInput.address.forEach((addr, index) => {
    if (typeof addr.street !== 'string' || addr.street.trim() === '') {
      throw new ApolloError(`Street at index ${index} not valid`);
    }
    if (typeof addr.city !== 'string' || addr.city.trim() === '') {
      throw new ApolloError(`city at index ${index} not valid`);
    }
    if (typeof addr.province !== 'string' || addr.province.trim() === '') {
      throw new ApolloError(`province at index ${index} not valid`);
    }
    if (
      typeof addr.postal_code !== 'string' ||
      addr.postal_code.trim() === ''
    ) {
      throw new ApolloError(`postal code at index ${index} not valid`);
    }
  });

  // *************** validate date_of_birth
  if (studentInput.date_of_birth) {
    const date = new Date(studentInput.date_of_birth);
    if (isNaN(date.getTime())) {
      // *************** error message if the input not valid
      throw new ApolloError('Date of birth must be a valid date.');
    }
  }

  // *************** validate school_id
  ValidateIdMongoose(studentInput.school_id, 'school_id');

  // *************** validate student email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!studentInput.email || !emailRegex.test(studentInput.email)) {
    // *************** error message if the input not valid
    throw new ApolloError('A valid email is required.');
  }
}

// *************** EXPORT MODULE ***************
module.exports = { ValidateStudentInput };
