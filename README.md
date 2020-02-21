# universal-comments

Take only memories, leave only comments

This is the web application powering the `Universal Comments` browser plugin ([repository](https://github.com/willemliu/universal-comments-plugin)).

Universal Comments extension:

-   [Edge](https://microsoftedge.microsoft.com/addons/detail/fakkiidfllacbdkgokbdigommkhmoeil)
-   [FireFox](https://addons.mozilla.org/nl/firefox/addon/universal-comments/)
-   [Chrome](https://chrome.google.com/webstore/detail/universal-comments/edoooaibkkjcnojedjhplakgaemchoeb)

# Development

## Prerequisites

1. [NodeJS v12+](https://nodejs.org/en/)
1. Zeit [Now](https://zeit.co/)
1. Hasura GraphQL endpoint
1. Heroku PostgreSQL
1. Auth0

## Getting started

1. Checkout this repository and navigate to the project root folder
1. Run `npm i` to install all necessary dependencies
1. Create a `.env.build` file with the following environment properties

    - `GRAPHQL_ENDPOINT=<the Hasura GraphQL endpoint>`
    - `HASURA_ADMIN_SECRET=<Hasura admin secret>`
    - `HASURA_ROLE=<Hasura role>`
    - `AUTH0_DOMAIN=<Auth0 domain>`
    - `AUTH0_CLIENT_ID=Auth0 client ID`

1. Run `now dev` to build and run the web app locally
    - navigate to `localhost:3000`

## Passing canonical urls

You can pass a canonical url by passing the `canonical` URL-parameter like so:

-   `localhost:3000?canonical=http://willemliu.nl`

When you pass a canonical URL then your comments will be attached to that specific URL.

## Circles

You can administer your circles by navigating to:

-   `localhost:3000/circles`

## Admin

You can administer all your own comments by navigating to:

-   `localhost:3000/admin`

## ERD

![ERD](https://github.com/willemliu/universal-comments/blob/master/screenshots/erd.jpg?raw=true 'ERD')
