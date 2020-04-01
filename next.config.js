module.exports = {
    experimental: {
        scss: true,
    },
    build: {
        env: {
            AUTH0_DOMAIN: process.env.AUTH0_DOMAIN,
            AUTH0_CLIENT_ID: process.env.AUTH0_CLIENT_ID,
            GRAPHQL_ENDPOINT: process.env.GRAPHQL_ENDPOINT,
            HASURA_ROLE: process.env.HASURA_ROLE,
            HASURA_ADMIN_SECRET: process.env.HASURA_ADMIN_SECRET,
            MAILJET_API_KEY: process.env.MAILJET_API_KEY,
            MAILJET_SECRET_KEY: process.env.MAILJET_SECRET_KEY,
        },
    },
    env: {
        // Will only be available on the server side
    },
};
