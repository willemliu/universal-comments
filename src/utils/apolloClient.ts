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
                        comments_aggregate(where: { removed: { _eq: false } }) {
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
                        comments_aggregate(
                            where: {
                                url: { _eq: $url }
                                removed: { _eq: false }
                            }
                        ) {
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

export async function addCircle(userId: string, uuid: string, name: string) {
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
                uuid,
                circleId: id,
            },
            mutation: gql`
                mutation InsertUserCircles(
                    $userId: String!
                    $circleId: uuid!
                    $uuid: uuid!
                ) {
                    insert_users_circles(
                        objects: {
                            user_id: $userId
                            user_uuid: $uuid
                            circle_id: $circleId
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

export async function joinCircle(
    userId: string,
    uuid: string,
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
                uuid,
                circleId: id,
                name,
                password,
            },
            mutation: gql`
                mutation JoinCircle(
                    $userId: String!
                    $uuid: uuid!
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
                        objects: {
                            circle_id: $circleId
                            user_id: $userId
                            user_uuid: $uuid
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

export async function getAllUserComments(uuid: string, offset = 0, limit = 10) {
    return await client
        .query({
            variables: {
                uuid,
                offset,
                limit,
            },
            query: gql`
                query GetAllUserComments(
                    $uuid: uuid!
                    $offset: Int!
                    $limit: Int!
                ) {
                    comments_aggregate(
                        where: {
                            user: {
                                uuid: { _eq: $uuid }
                                comments: { removed: { _eq: false } }
                            }
                        }
                    ) {
                        aggregate {
                            count
                        }
                    }
                    comments(
                        where: { user_uuid: { _eq: $uuid } }
                        order_by: { timestamp: asc }
                        limit: $limit
                        offset: $offset
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
                            uuid
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
            return value?.data;
        });
}

export async function insertComment(
    userId: string,
    uuid: string,
    url: string,
    comment: string,
    parentId?: number,
    circleId?: string
) {
    return await client
        .mutate({
            variables: {
                comment,
                url,
                userId,
                uuid,
                parentId,
                circleId,
            },
            mutation: gql`
                mutation InsertComment(
                    $comment: String!
                    $url: String!
                    $userId: String!
                    $uuid: uuid!
                    $parentId: uuid
                    $circleId: uuid
                ) {
                    insert_comments(
                        objects: {
                            comment: $comment
                            url: $url
                            user_id: $userId
                            user_uuid: $uuid
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
                                uuid
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
    uuid: string,
    vote: number,
    commentId: number
) {
    return await client
        .mutate({
            variables: {
                userId,
                uuid,
                vote,
                commentId,
            },
            mutation: gql`
                mutation Vote(
                    $userId: String!
                    $uuid: uuid!
                    $vote: Int!
                    $commentId: uuid!
                ) {
                    insert_scores(
                        objects: {
                            user_id: $userId
                            user_uuid: $uuid
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

export async function removeComment(
    commentId: number,
    userId: string,
    uuid: string
) {
    return await client
        .mutate({
            variables: {
                commentId,
                userId,
                uuid,
            },
            mutation: gql`
                mutation RemoveComment(
                    $commentId: uuid!
                    $userId: String!
                    $uuid: uuid!
                ) {
                    update_comments(
                        where: {
                            id: { _eq: $commentId }
                            user_id: { _eq: $userId }
                            user_uuid: { _eq: $uuid }
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
                            removed: { _eq: false }
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

export async function getAllCommentsCount() {
    return await client
        .query({
            query: gql`
                query AllCommentsCount {
                    comments_aggregate(
                        where: {
                            circle_id: { _is_null: true }
                            removed: { _eq: false }
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

export async function getAllCommentsCountByCircle(
    uuid: string,
    circleId: string
) {
    return await client
        .query({
            variables: {
                uuid,
                circleId,
            },
            query: gql`
                query AllCommentsCountByCircle($uuid: uuid!, $circleId: uuid!) {
                    comments_aggregate(
                        where: {
                            circle_id: { _eq: $circleId }
                            circle: {
                                users_circles: { user_uuid: { _eq: $uuid } }
                            }
                            removed: { _eq: false }
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
                            uuid
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

export async function getCommentsByCircleId(
    url: string,
    uuid: string,
    circleId: string
) {
    return await client
        .query({
            variables: { url, uuid, circleId },
            query: gql`
                query GetCommentsByCircleId(
                    $url: String!
                    $uuid: uuid
                    $circleId: uuid
                ) {
                    comments(
                        where: {
                            url: { _eq: $url }
                            circle_id: { _eq: $circleId }
                            circle: {
                                users_circles: { user_uuid: { _eq: $uuid } }
                            }
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
                            uuid
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
                            removed: { _eq: false }
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

export async function getLatestPositivePublicComments(offset = 0, limit = 10) {
    return await client
        .query({
            variables: { offset, limit },
            query: gql`
                query LatestPositivePublicComments(
                    $offset: Int!
                    $limit: Int!
                ) {
                    comments(
                        order_by: { timestamp: desc }
                        offset: $offset
                        limit: $limit
                        where: {
                            circle_id: { _is_null: true }
                            removed: { _eq: false }
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

export async function getLatestPositiveCircleComments(
    uuid: string,
    circleId: string,
    offset = 0,
    limit = 10
) {
    return await client
        .query({
            variables: { uuid, circle_id: circleId, offset, limit },
            query: gql`
                query LatestPositiveCircleComments(
                    $uuid: uuid!
                    $circle_id: uuid!
                    $offset: Int!
                    $limit: Int!
                ) {
                    comments(
                        order_by: { timestamp: desc }
                        offset: $offset
                        limit: $limit
                        where: {
                            circle_id: { _eq: $circle_id }
                            removed: { _eq: false }
                            circle: {
                                users_circles: { user_uuid: { _eq: $uuid } }
                            }
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
