/**
 * Extracts pagination parameters from the request query and computes Prisma `skip` and `take`.
 * Enforces a maximum limit per page to prevent massive DB queries.
 *
 * @param {Object} query - The req.query object from Express
 * @param {number} defaultLimit - The default number of items per page
 * @param {number} maxLimit - The hard cap on items per page
 * @returns {Object} { skip, take, page, limit }
 */
const getPagination = (query, defaultLimit = 10, maxLimit = 100) => {
    const page = Math.max(1, parseInt(query.page, 10) || 1);
    let limit = parseInt(query.limit, 10) || defaultLimit;

    // Enforce max limit to prevent abuse
    if (limit > maxLimit) {
        limit = maxLimit;
    }

    const skip = (page - 1) * limit;

    return { skip, take: limit, page, limit };
};

/**
 * Formats the paginated response with useful metadata.
 *
 * @param {Array} data - The array of records returned from DB
 * @param {number} totalItems - Total count of records matching the query
 * @param {number} page - Current page number
 * @param {number} limit - Number of items requested per page
 * @returns {Object} Standardized paginated response
 */
const formatPaginatedResponse = (data, totalItems, page, limit) => {
    const totalPages = Math.ceil(totalItems / limit);

    return {
        data,
        metadata: {
            totalItems,
            itemsCount: data.length,
            page,
            limit,
            totalPages,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1
        }
    };
};

module.exports = {
    getPagination,
    formatPaginatedResponse
};
