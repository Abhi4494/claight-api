const getPagination = (body) => {
    const page = parseInt(body.page) || 1;
    const limit = parseInt(body.limit) || 10;
    const offset = (page - 1) * limit;
    return { page, limit, offset };
};

const getPaginationResponse = (count, page, limit) => {
    return {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
    };
};

export { getPagination, getPaginationResponse };
