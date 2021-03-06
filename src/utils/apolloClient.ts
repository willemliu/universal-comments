import 'isomorphic-unfetch';
import ApolloClient, { gql } from 'apollo-boost';

declare let process: any;

export const PAGE_SIZE = 100;
export const LATEST_COMMENTS_SIZE = 10;

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
                            receive_mail
                        }
                    }
                }
            `,
        })
        .then((value: any) => {
            return value?.data?.insert_users?.returning?.[0];
        });
}

export async function UpdateReceiveMail(uuid: string, receive_mail: boolean) {
    return await client
        .mutate({
            variables: {
                uuid,
                receive_mail,
            },
            mutation: gql`
                mutation UpdateReceiveMail(
                    $uuid: uuid!
                    $receive_mail: Boolean!
                ) {
                    update_users(
                        where: { uuid: { _eq: $uuid } }
                        _set: { receive_mail: $receive_mail }
                    ) {
                        affected_rows
                    }
                }
            `,
        })
        .then((value: any) => {
            return value?.data?.insert_users?.returning?.[0];
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
                                _or: [{ user: { active: { _eq: true } } }]
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
                        objects: {
                            circle_id: $circleId
                            user_id: $userId
                            user_uuid: $uuid
                        }
                        on_conflict: {
                            where: {
                                circle: {
                                    name: { _eq: $name }
                                    password: { _eq: $password }
                                }
                            }
                            constraint: users_circles_user_id_circle_id_key
                            update_columns: [user_id, user_uuid]
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

export async function getAllUserComments(
    uuid: string,
    offset = 0,
    limit = PAGE_SIZE
) {
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
                        where: { user: { uuid: { _eq: $uuid } } }
                        order_by: { timestamp: asc }
                        limit: $limit
                        offset: $offset
                    ) {
                        id
                        url
                        comment
                        edited_comment
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
    parentId?: string,
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
                            edited_comment
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

export async function editComment(
    commentId: string,
    userId: string,
    uuid: string,
    url: string,
    comment: string
) {
    return await client
        .mutate({
            variables: {
                id: commentId,
                comment,
                url,
                userId,
                uuid,
            },
            mutation: gql`
                mutation EditComment(
                    $id: uuid!
                    $comment: String!
                    $url: String!
                    $userId: String!
                    $uuid: uuid!
                ) {
                    update_comments(
                        where: {
                            id: { _eq: $id }
                            user: { uuid: { _eq: $uuid }, id: { _eq: $userId } }
                            url: { _eq: $url }
                        }
                        _set: { edited_comment: $comment, updated: "now()" }
                    ) {
                        returning {
                            id
                            url
                            comment
                            edited_comment
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
            return data?.update_comments?.returning?.[0];
        });
}

export async function insertScore(
    userId: string,
    uuid: string,
    vote: number,
    commentId: string
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
    commentId: string,
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
                            user: { uuid: { _eq: $uuid } }
                        }
                        _set: { removed: true, updated: "now()" }
                    ) {
                        returning {
                            id
                            updated
                            comment
                            edited_comment
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
                query CommentCountByUrl($url: String!) {
                    comments_aggregate(
                        where: {
                            url: { _eq: $url }
                            circle_id: { _is_null: true }
                            user: { active: { _eq: true } }
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

export async function getCircleCommentCountByUrl(
    url: string,
    uuid: string,
    circleId: string
) {
    if (!uuid) {
        return [];
    }
    return await client
        .query({
            variables: {
                uuid,
                url,
                circleId,
            },
            query: gql`
                query CircleCommentCountByUrl(
                    $url: String!
                    $uuid: uuid
                    $circleId: uuid
                ) {
                    comments_aggregate(
                        where: {
                            url: { _eq: $url }
                            circle_id: { _eq: $circleId }
                            user: {
                                active: { _eq: true }
                                users_circles: {
                                    user: { uuid: { _eq: $uuid } }
                                }
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
        .then((value) => {
            return value?.data?.comments_aggregate?.aggregate?.count;
        });
}

export async function getAllCommentsCount(uuid?: string) {
    return await client
        .query({
            variables: { uuid },
            query: gql`
                query AllCommentsCount($uuid: uuid) {
                    comments_aggregate(
                        where: {
                            circle_id: { _is_null: true }
                            removed: { _eq: false }
                            user: {
                                _or: [
                                    { active: { _eq: true } }
                                    {
                                        _and: [
                                            { _not: { uuid: { _neq: $uuid } } }
                                            { uuid: { _eq: $uuid } }
                                        ]
                                    }
                                ]
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
                                users_circles: {
                                    user: { uuid: { _eq: $uuid } }
                                }
                            }
                            user: {
                                _or: [
                                    { active: { _eq: true } }
                                    {
                                        _and: [
                                            { _not: { uuid: { _neq: $uuid } } }
                                            { uuid: { _eq: $uuid } }
                                        ]
                                    }
                                ]
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

export async function getCommentsByUrl(
    url: string,
    uuid?: string,
    offset = 0,
    limit = PAGE_SIZE
) {
    return await client
        .query({
            variables: { url, uuid, offset, limit },
            query: gql`
                query CommentsByUrl(
                    $url: String!
                    $uuid: uuid
                    $offset: Int
                    $limit: Int
                ) {
                    comments(
                        where: {
                            url: { _eq: $url }
                            circle_id: { _is_null: true }
                            user: {
                                _or: [
                                    { active: { _eq: true } }
                                    {
                                        _and: [
                                            { _not: { uuid: { _neq: $uuid } } }
                                            { uuid: { _eq: $uuid } }
                                        ]
                                    }
                                ]
                            }
                        }
                        order_by: { timestamp: asc }
                        limit: $limit
                        offset: $offset
                    ) {
                        id
                        url
                        comment
                        edited_comment
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
                    comments_aggregate(
                        where: {
                            url: { _eq: $url }
                            circle_id: { _is_null: true }
                            removed: { _eq: false }
                            user: {
                                _or: [
                                    { active: { _eq: true } }
                                    {
                                        _and: [
                                            { _not: { uuid: { _neq: $uuid } } }
                                            { uuid: { _eq: $uuid } }
                                        ]
                                    }
                                ]
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
        .then((value) => {
            return value?.data?.comments;
        });
}

export async function getCommentsByCircleId(
    url: string,
    uuid: string,
    circleId: string,
    offset = 0,
    limit = PAGE_SIZE
) {
    return await client
        .query({
            variables: { url, uuid, circleId, offset, limit },
            query: gql`
                query GetCommentsByCircleId(
                    $url: String!
                    $uuid: uuid
                    $circleId: uuid
                    $offset: Int
                    $limit: Int
                ) {
                    comments(
                        where: {
                            url: { _eq: $url }
                            circle_id: { _eq: $circleId }
                            user: {
                                _or: [
                                    { active: { _eq: true } }
                                    {
                                        _and: [
                                            { _not: { uuid: { _neq: $uuid } } }
                                            { uuid: { _eq: $uuid } }
                                        ]
                                    }
                                ]
                            }
                            circle: {
                                users_circles: {
                                    user: { uuid: { _eq: $uuid } }
                                }
                            }
                        }
                        order_by: { timestamp: asc }
                        limit: $limit
                        offset: $offset
                    ) {
                        id
                        url
                        comment
                        edited_comment
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
                            user: { active: { _eq: true } }
                        }
                        order_by: { timestamp: desc }
                    ) {
                        id
                        comment
                        edited_comment
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

export async function getLatestPositivePublicComments(
    offset = 0,
    limit = LATEST_COMMENTS_SIZE,
    uuid?: string
) {
    return await client
        .query({
            variables: { offset, limit, uuid },
            query: gql`
                query LatestPositivePublicComments(
                    $offset: Int!
                    $limit: Int!
                    $uuid: uuid
                ) {
                    comments(
                        order_by: { timestamp: desc }
                        offset: $offset
                        limit: $limit
                        where: {
                            circle_id: { _is_null: true }
                            removed: { _eq: false }
                            user: {
                                _or: [
                                    { active: { _eq: true } }
                                    {
                                        _and: [
                                            { _not: { uuid: { _neq: $uuid } } }
                                            { uuid: { _eq: $uuid } }
                                        ]
                                    }
                                ]
                            }
                        }
                    ) {
                        scores_aggregate {
                            aggregate {
                                sum {
                                    score
                                }
                            }
                        }
                        id
                        comment
                        edited_comment
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
    limit = LATEST_COMMENTS_SIZE
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
                            user: {
                                _or: [
                                    { active: { _eq: true } }
                                    {
                                        _and: [
                                            { _not: { uuid: { _neq: $uuid } } }
                                            { uuid: { _eq: $uuid } }
                                        ]
                                    }
                                ]
                            }
                            circle: {
                                users_circles: {
                                    user: { uuid: { _eq: $uuid } }
                                }
                            }
                        }
                    ) {
                        scores_aggregate {
                            aggregate {
                                sum {
                                    score
                                }
                            }
                        }
                        id
                        comment
                        edited_comment
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

export async function getOtherUsers(
    url: string,
    uuid: string,
    commentUuid: string
) {
    return await client
        .query({
            variables: { uuid, url, commentUuid },
            query: gql`
                query OtherUsers(
                    $uuid: uuid!
                    $url: String!
                    $commentUuid: uuid!
                ) {
                    users(
                        where: {
                            comments: {
                                user: { _not: { uuid: { _eq: $uuid } } }
                                url: { _eq: $url }
                            }
                            active: { _eq: true }
                            receive_mail: { _eq: true }
                        }
                    ) {
                        display_name
                        email
                    }
                    comments(
                        where: {
                            url: { _eq: $url }
                            user: { uuid: { _eq: $uuid } }
                            id: { _eq: $commentUuid }
                            circle_id: { _is_null: true }
                        }
                    ) {
                        comment
                    }
                }
            `,
        })
        .then((value) => {
            return value?.data;
        });
}

export async function getOtherUsersFromCircle(
    url: string,
    uuid: string,
    commentUuid: string,
    circleId: string
) {
    return await client
        .query({
            variables: { uuid, url, commentUuid, circleId },
            query: gql`
                query OtherUsers(
                    $uuid: uuid!
                    $url: String!
                    $commentUuid: uuid!
                    $circleId: uuid!
                ) {
                    users(
                        where: {
                            comments: {
                                user: { _not: { uuid: { _eq: $uuid } } }
                                url: { _eq: $url }
                                circle: { id: { _eq: $circleId } }
                            }
                            active: { _eq: true }
                            receive_mail: { _eq: true }
                            users_circles: {
                                circle: { id: { _eq: $circleId } }
                            }
                        }
                    ) {
                        display_name
                        email
                        users_circles(
                            where: { circle: { id: { _eq: $circleId } } }
                        ) {
                            circle {
                                name
                            }
                        }
                    }
                    comments(
                        where: {
                            url: { _eq: $url }
                            user: { uuid: { _eq: $uuid } }
                            id: { _eq: $commentUuid }
                            circle_id: { _eq: $circleId }
                        }
                    ) {
                        comment
                    }
                }
            `,
        })
        .then((value) => {
            return value?.data;
        });
}
