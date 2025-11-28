/**
 * Postcode extraction utilities
 * Functions for parsing and extracting UK postcode districts from full postcodes
 */

/**
 * Extract postcode district from a full UK postcode
 * Example: "NE1 4ST" → "NE1", "TS16 1AA" → "TS16"
 *
 * @param {string} postcode - Full UK postcode or district
 * @returns {string|null} Postcode district (area + digits) or null if invalid
 */
export function extractDistrict(postcode) {
  if (!postcode || typeof postcode !== 'string') {
    return null;
  }

  // Match the district part (one or two letters followed by one or two numbers, optionally followed by a letter)
  // Examples: NE1, TS16, SW1A, W1H
  const match = postcode.trim().toUpperCase().match(/^[A-Z]{1,2}\d{1,2}[A-Z]?/);
  return match ? match[0] : null;
}

/**
 * Extract unique postcode districts from an array of data items
 *
 * @param {Array} data - Array of objects with postcode field
 * @param {string} postcodeField - Name of the field containing postcode
 * @returns {Set} Set of unique postcode districts
 */
export function extractUniquePostcodes(data, postcodeField = 'postcode') {
  const postcodeDistricts = new Set();

  if (!Array.isArray(data)) {
    return postcodeDistricts;
  }

  data.forEach(item => {
    const district = extractDistrict(item[postcodeField]);
    if (district) {
      postcodeDistricts.add(district);
    }
  });

  return postcodeDistricts;
}

/**
 * Group postcode districts by their area code
 * Example: ["NE1", "NE2", "TS1"] → { "NE": Set(["NE1", "NE2"]), "TS": Set(["TS1"]) }
 *
 * @param {Array|Set} districts - Array or Set of postcode districts
 * @returns {Object} Object mapping area codes to Sets of districts
 */
export function groupDistrictsByArea(districts) {
  const districtArray = Array.from(districts);

  return districtArray.reduce((acc, district) => {
    const areaMatch = district.match(/^[A-Z]{1,2}/i);
    if (areaMatch) {
      const areaCode = areaMatch[0].toUpperCase();
      if (!acc[areaCode]) {
        acc[areaCode] = new Set();
      }
      acc[areaCode].add(district);
    }
    return acc;
  }, {});
}
