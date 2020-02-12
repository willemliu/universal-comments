import 'isomorphic-unfetch';
import ApolloClient, { gql } from 'apollo-boost';

declare let process: any;

const headers = {
    'X-Hasura-Role': process.env.HASURA_ROLE,
};
if (process.env.HASURA_ADMIN_SECRET) {
    headers['x-hasura-admin-secret'] = process.env.HASURA_ADMIN_SECRET;
}

// the Apollo cache is set up automatically
const client = new ApolloClient({
    uri: process.env.GRAPHQL_ENDPOINT,
    name: 'hasura-test',
    credentials: 'include',
    headers,
});

client.defaultOptions.watchQuery = {
    fetchPolicy: 'no-cache',
    errorPolicy: 'all',
};
client.defaultOptions.query = {
    fetchPolicy: 'no-cache',
    errorPolicy: 'all',
};

export function getApolloClient() {
    return client;
}

export async function createUser(
    id: string,
    name: string,
    email: string,
    image: string,
    token: string
) {
    return await client
        .mutate({
            variables: {
                email,
                id,
                name,
                image,
                token,
            },
            mutation: gql`
                mutation InsertUsers(
                    $email: String!
                    $id: String!
                    $name: String!
                    $image: String!
                    $token: String
                ) {
                    insert_users(
                        objects: {
                            email: $email
                            id: $id
                            display_name: $name
                            image: $image
                            token: $token
                        }
                        on_conflict: {
                            constraint: users_email_key
                            update_columns: [id, display_name, image, token]
                        }
                    ) {
                        returning {
                            uuid
                        }
                    }
                }
            `,
        })
        .then((value: any) => {
            return value?.data?.insert_users?.returning?.[0]?.uuid;
        });
}

export async function getCircles(uuid: string) {
    if (!uuid) {
        return [];
    }
    return await client
        .query({
            variables: {
                uuid,
            },
            query: gql`
                query GetCircles($uuid: uuid!) {
                    circles(
                        where: {
                            users_circles: { user: { uuid: { _eq: $uuid } } }
                        }
                        order_by: { name: asc }
                    ) {
                        id
                        name
                        password
                        timestamp
                        comments_aggregate {
                            aggregate {
                                count(columns: id)
                            }
                        }
                        users_circles_aggregate {
                            aggregate {
                                count
                            }
                        }
                    }
                }
            `,
        })
        .then((value) => {
            return value?.data?.circles;
        });
}

export async function getCirclesByUrl(url: string, uuid: string) {
    if (!uuid) {
        return [];
    }
    return await client
        .query({
            variables: {
                uuid,
                url,
            },
            query: gql`
                query GetCirclesByUrl($uuid: uuid!, $url: String!) {
                    circles(
                        where: {
                            users_circles: { user: { uuid: { _eq: $uuid } } }
                        }
                        order_by: { name: asc }
                    ) {
                        id
                        name
                        password
                        timestamp
                        comments_aggregate(where: { url: { _eq: $url } }) {
                            aggregate {
                                count(columns: id)
                            }
                        }
                        users_circles_aggregate {
                            aggregate {
                                count
                            }
                        }
                    }
                }
            `,
        })
        .then((value) => {
            return value?.data?.circles;
        });
}

export async function addCircle(userId: string, name: string) {
    const id = await client
        .mutate({
            variables: {
                name,
            },
            mutation: gql`
                mutation InsertCircles($name: String!) {
                    insert_circles(objects: { name: $name }) {
                        returning {
                            id
                        }
                    }
                }
            `,
        })
        .then((value: any) => {
            return value?.data?.insert_circles?.returning?.[0]?.id;
        });

    return await client
        .mutate({
            variables: {
                userId,
                circleId: id,
            },
            mutation: gql`
                mutation($userId: String!, $circleId: uuid!) {
                    insert_users_circles(
                        objects: { user_id: $userId, circle_id: $circleId }
                    ) {
                        affected_rows
                    }
                }
            `,
        })
        .then((value: any) => {
            return value;
        });
}

export async function joinCircle(
    userId: string,
    name: string,
    password: string
) {
    const id = await client
        .query({
            variables: {
                name,
                password,
            },
            query: gql`
                query GetCircleId($name: String!, $password: uuid!) {
                    circles(
                        where: {
                            name: { _eq: $name }
                            password: { _eq: $password }
                        }
                    ) {
                        id
                    }
                }
            `,
        })
        .then((value: any) => {
            return value?.data?.circles?.[0]?.id;
        });

    return await client
        .mutate({
            variables: {
                userId,
                circleId: id,
                name,
                password,
            },
            mutation: gql`
                mutation JoinCircle(
                    $userId: String!
                    $circleId: uuid!
                    $name: String!
                    $password: uuid!
                ) {
                    insert_users_circles(
                        on_conflict: {
                            where: {
                                circle: {
                                    name: { _eq: $name }
                                    password: { _eq: $password }
                                }
                            }
                            constraint: users_circles_user_id_circle_id_key
                            update_columns: user_id
                        }
                        objects: { circle_id: $circleId, user_id: $userId }
                    ) {
                        affected_rows
                    }
                }
            `,
        })
        .then((value: any) => {
            return value;
        });
}

export async function leaveCircle(
    uuid: string,
    name: string,
    password: string
) {
    const count = await client
        .query({
            variables: {
                name,
                password,
            },
            query: gql`
                query GetUsersCirclesCount($name: String!, $password: uuid!) {
                    users_circles_aggregate(
                        where: {
                            circle: {
                                name: { _eq: $name }
                                password: { _eq: $password }
                            }
                        }
                    ) {
                        aggregate {
                            count
                        }
                    }
                }
            `,
        })
        .then((value: any) => {
            return value?.data?.users_circles_aggregate?.aggregate?.count;
        });

    if (count <= 1) {
        return Promise.reject(
            `You can't leave the circle because you are its last member!`
        );
    }

    return await client
        .mutate({
            variables: {
                uuid,
                name,
                password,
            },
            mutation: gql`
                mutation LeaveCircle(
                    $uuid: uuid!
                    $name: String!
                    $password: uuid!
                ) {
                    delete_users_circles(
                        where: {
                            circle: {
                                name: { _eq: $name }
                                password: { _eq: $password }
                            }
                            user: { uuid: { _eq: $uuid } }
                        }
                    ) {
                        affected_rows
                    }
                }
            `,
        })
        .then((value: any) => {
            return value;
        });
}

export async function removeCircle(id: number, name: string, password: string) {
    return await client
        .mutate({
            variables: {
                id,
                name,
                password,
            },
            mutation: gql`
                mutation DeleteCircles(
                    $id: uuid!
                    $name: String!
                    $password: uuid!
                ) {
                    delete_circles(
                        where: {
                            id: { _eq: $id }
                            name: { _eq: $name }
                            password: { _eq: $password }
                        }
                    ) {
                        affected_rows
                    }
                }
            `,
        })
        .then((value: any) => {
            return value;
        });
}

export async function getAllUserComments(uuid: string) {
    return await client
        .query({
            variables: {
                uuid,
            },
            query: gql`
                query GetAllUserComments($uuid: uuid!) {
                    comments(
                        where: {
                            user: { uuid: { _eq: $uuid } }
                            removed: { _eq: false }
                        }
                        order_by: { timestamp: asc }
                    ) {
                        id
                        url
                        comment
                        parent_id
                        timestamp
                        updated
                        removed
                        user {
                            id
                            display_name
                            image
                        }
                        scores_aggregate {
                            aggregate {
                                sum {
                                    score
                                }
                            }
                        }
                    }
                }
            `,
        })
        .then((value) => {
            return value?.data?.comments;
        });
}

export async function insertComment(
    userId: string,
    url: string,
    comment: string,
    parentId?: number,
    circleId?: number
) {
    return await client
        .mutate({
            variables: {
                comment,
                url,
                userId,
                parentId,
                circleId,
            },
            mutation: gql`
                mutation(
                    $comment: String!
                    $url: String!
                    $userId: String!
                    $parentId: uuid
                    $circleId: uuid
                ) {
                    insert_comments(
                        objects: {
                            comment: $comment
                            url: $url
                            user_id: $userId
                            parent_id: $parentId
                            circle_id: $circleId
                        }
                    ) {
                        returning {
                            id
                            url
                            comment
                            parent_id
                            circle_id
                            removed
                            timestamp
                            updated
                            scores_aggregate {
                                aggregate {
                                    sum {
                                        score
                                    }
                                }
                            }
                            user {
                                id
                                display_name
                                image
                            }
                        }
                    }
                }
            `,
        })
        .then(({ data }: any) => {
            return data?.insert_comments?.returning?.[0];
        });
}

export async function insertScore(
    userId: string,
    vote: number,
    commentId: number
) {
    return await client
        .mutate({
            variables: {
                userId,
                vote,
                commentId,
            },
            mutation: gql`
                mutation Vote(
                    $userId: String!
                    $vote: Int!
                    $commentId: uuid!
                ) {
                    insert_scores(
                        objects: {
                            user_id: $userId
                            score: $vote
                            comment_id: $commentId
                        }
                        on_conflict: {
                            constraint: scores_comment_id_user_id_key
                            update_columns: score
                        }
                    ) {
                        returning {
                            comment {
                                scores_aggregate {
                                    aggregate {
                                        sum {
                                            score
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            `,
        })
        .then(({ data }: any) => {
            return (
                data?.insert_scores?.returning?.[0]?.comment?.scores_aggregate
                    ?.aggregate?.sum?.score || 0
            );
        });
}

export async function removeComment(commentId: number, userId: string) {
    return await client
        .mutate({
            variables: {
                commentId,
                userId,
            },
            mutation: gql`
                mutation($commentId: uuid!, $userId: String!) {
                    update_comments(
                        where: {
                            id: { _eq: $commentId }
                            user_id: { _eq: $userId }
                        }
                        _set: { removed: true, updated: "now()" }
                    ) {
                        returning {
                            id
                            updated
                            comment
                            removed
                        }
                    }
                }
            `,
        })
        .then((value) => {
            return value?.data?.update_comments?.returning?.[0];
        });
}

export async function getCommentCount(url: string) {
    return await client
        .query({
            variables: {
                url,
            },
            query: gql`
                query CommentCount($url: String!) {
                    comments_aggregate(
                        where: {
                            url: { _eq: $url }
                            circle_id: { _is_null: true }
                        }
                    ) {
                        aggregate {
                            count
                        }
                    }
                }
            `,
        })
        .then(({ data }: any) => {
            return data?.comments_aggregate?.aggregate?.count || 0;
        });
}

export async function getCommentsByUrl(url: string) {
    return await client
        .query({
            variables: { url },
            query: gql`
                query CommentsByUrl($url: String!) {
                    comments(
                        where: {
                            url: { _eq: $url }
                            circle_id: { _is_null: true }
                        }
                        order_by: { timestamp: asc }
                    ) {
                        id
                        url
                        comment
                        parent_id
                        circle_id
                        timestamp
                        updated
                        removed
                        user {
                            id
                            display_name
                            image
                        }
                        scores_aggregate {
                            aggregate {
                                sum {
                                    score
                                }
                            }
                        }
                    }
                }
            `,
        })
        .then((value) => {
            return value?.data?.comments;
        });
}

export async function getCommentsByCircleId(url: string, circleId?: string) {
    return await client
        .query({
            variables: { url, circleId },
            query: gql`
                query($url: String!, $circleId: uuid) {
                    comments(
                        where: {
                            url: { _eq: $url }
                            circle_id: { _eq: $circleId }
                        }
                        order_by: { timestamp: asc }
                    ) {
                        id
                        url
                        comment
                        parent_id
                        circle_id
                        timestamp
                        updated
                        removed
                        user {
                            id
                            display_name
                            image
                        }
                        scores_aggregate {
                            aggregate {
                                sum {
                                    score
                                }
                            }
                        }
                    }
                }
            `,
        })
        .then((value) => {
            return value?.data?.comments;
        });
}

export async function getLatestPublicComments(limit: number) {
    return await client
        .query({
            variables: { limit },
            query: gql`
                query LatestComments($limit: Int!) {
                    comments(
                        limit: $limit
                        where: {
                            circle_id: { _is_null: true }
                            parent_id: { _is_null: true }
                        }
                        order_by: { timestamp: desc }
                    ) {
                        id
                        comment
                        timestamp
                        url
                        user {
                            display_name
                        }
                    }
                }
            `,
        })
        .then((value) => {
            return value?.data?.comments;
        });
}

export async function getLatestPositivePublicComments(limit: number) {
    return await client
        .query({
            variables: { limit },
            query: gql`
                query LatestPositivePublicComments($limit: Int!) {
                    comments(
                        order_by: { timestamp: desc }
                        limit: $limit
                        where: {
                            circle_id: { _is_null: true }
                            parent_id: { _is_null: true }
                        }
                    ) {
                        scores_aggregate(
                            where: { _not: { score: { _lt: 0 } } }
                        ) {
                            aggregate {
                                sum {
                                    score
                                }
                            }
                        }
                        id
                        comment
                        timestamp
                        url
                        user {
                            display_name
                        }
                    }
                }
            `,
        })
        .then((value) => {
            return value?.data?.comments;
        });
}
