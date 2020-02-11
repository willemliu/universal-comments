module.exports = {
    experimental: {
        scss: true,
    },
    env: {
        AUTH0_DOMAIN: process.env.AUTH0_DOMAIN,
        AUTH0_CLIENT_ID: process.env.AUTH0_CLIENT_ID,
        GRAPHQL_ENDPOINT: process.env.GRAPHQL_ENDPOINT,
        HASURA_ROLE: process.env.HASURA_ROLE,
        HASURA_ADMIN_SECRET: process.env.HASURA_ADMIN_SECRET,
    },
};
