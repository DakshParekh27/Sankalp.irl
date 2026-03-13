const db = require('../config/db');

/**
 * Finds the ward ID that contains the given latitude and longitude.
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {number|null} ward_id or null if no ward contains the point
 */
const findWardByCoordinates = async (lat, lng) => {
    try {
        // SRID 4326 is standard GPS coordinates (WGS 84)
        // Note: PostGIS ST_Point takes (longitude, latitude)
        const query = `
            SELECT id 
            FROM wards 
            WHERE ST_Contains(
                polygon_geometry, 
                ST_SetSRID(ST_Point($1, $2), 4326)
            )
        `;
        
        const result = await db.query(query, [lng, lat]);
        
        if (result.rows.length > 0) {
            return result.rows[0].id;
        }
        return null;
    } catch (error) {
        console.error('Error finding ward by coordinates:', error);
        throw error;
    }
};

module.exports = {
    findWardByCoordinates
};
