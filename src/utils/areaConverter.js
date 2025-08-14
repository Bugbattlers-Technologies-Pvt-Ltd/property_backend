// utils/areaConverter.js

const UNIT_CONVERSION = {
  sqft: 1,
  guntha: 1089,
  acre: 43560,
  sqm: 10.7639
};

/**
 * Convert area from input (manual area in sqft/sqm OR length × breadth)
 * @param {Object} options
 * @param {number} [options.area] - Manually entered area
 * @param {string} [options.unit] - Unit of the manually entered area ("sqft" or "sqm")
 * @param {number} [options.length] - Length in feet
 * @param {number} [options.breadth] - Breadth in feet
 * @returns {{ originalValue, sqft, sqm, guntha, acre }}
 */
function convertArea({ area, unit = 'sqft', length, breadth }) {
  let sqft = 0;

  if (typeof area === 'number') {
    // Manual area entry with unit
    sqft = unit === 'sqm' ? area * UNIT_CONVERSION.sqm : area;
  } else if (typeof length === 'number' && typeof breadth === 'number') {
    // Calculate area from length × breadth (assumed in feet)
    sqft = length * breadth;
  }

  // Final conversion
  return {
    originalValue: +sqft.toFixed(2),
    sqft: +sqft.toFixed(2),
    sqm: +(sqft / UNIT_CONVERSION.sqm).toFixed(2),
    guntha: +(sqft / UNIT_CONVERSION.guntha).toFixed(4),
    acre: +(sqft / UNIT_CONVERSION.acre).toFixed(4)
  };
}

module.exports = convertArea;
