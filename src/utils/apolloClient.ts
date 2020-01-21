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
    const client = getApolloClient();
    await client
        .mutate({
            variables: {
                email,
                id,
                name,
                image,
                token,
            },
            mutation: gql`
                mutation(
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
                        affected_rows
                    }
                }
            `,
        })
        .then(({ data }: any) => {
            console.log(data);
        })
        .catch(console.error);
}

export async function getCircles(accessToken: string) {
    return await client
        .query({
            variables: {
                accessToken,
            },
            query: gql`
                query GetCircles($accessToken: String!) {
                    circles(
                        where: {
                            users_circles: {
                                user: { token: { _eq: $accessToken } }
                            }
                        }
                        order_by: { name: asc }
                    ) {
                        id
                        name
                        password
                        comments_aggregate {
                            aggregate {
                                count(columns: id)
                            }
                        }
                    }
                }
            `,
        })
        .then((value) => {
            console.log(value?.data?.circles);
            return value?.data?.circles;
        });
}

export async function addCircle(
    userId: string,
    name: string,
    password: string
) {
    try {
        const id = await client
            .mutate({
                variables: {
                    name,
                    password,
                },
                mutation: gql`
                    mutation($name: String!, $password: String!) {
                        insert_circles(
                            objects: { name: $name, password: $password }
                        ) {
                            returning {
                                id
                            }
                        }
                    }
                `,
            })
            .then((value: any) => {
                console.log(value);
                return value?.data?.insert_circles?.returning?.[0]?.id;
            });

        await client
            .mutate({
                variables: {
                    userId,
                    circleId: id,
                },
                mutation: gql`
                    mutation($userId: String!, $circleId: bigint!) {
                        insert_users_circles(
                            objects: { user_id: $userId, circle_id: $circleId }
                        ) {
                            affected_rows
                        }
                    }
                `,
            })
            .then((value: any) => {
                console.log(value);
            });
    } catch (err) {
        console.error(err);
        alert(
            `Couldn't add the [${name}] circle. Please notify the administrator of this error.`
        );
    }
}

export async function joinCircle(
    userId: string,
    name: string,
    password: string
) {
    try {
        console.log();
        const id = await client
            .query({
                variables: {
                    name,
                    password,
                },
                query: gql`
                    query($name: String!, $password: String!) {
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
                console.log(value);
                return value?.data?.circles?.[0]?.id;
            });

        await client
            .mutate({
                variables: {
                    userId,
                    circleId: id,
                    name,
                    password,
                },
                mutation: gql`
                    mutation(
                        $userId: String!
                        $circleId: bigint!
                        $name: String!
                        $password: String!
                    ) {
                        insert_users_circles(
                            on_conflict: {
                                where: {
                                    circle: {
                                        name: { _eq: $name }
                                        password: { _eq: $password }
                                    }
                                }
                                constraint: users_circles_circle_id_user_id_key
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
                console.log(value);
            });
    } catch (err) {
        console.error(err);
        alert(
            `Couldn't join the [${name}] circle. Please notify the administrator of this error.`
        );
    }
}

export async function leaveCircle(
    token: string,
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
                query($name: String!, $password: String!) {
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
                token,
                name,
                password,
            },
            mutation: gql`
                mutation($token: String!, $name: String!, $password: String!) {
                    delete_users_circles(
                        where: {
                            circle: {
                                name: { _eq: $name }
                                password: { _eq: $password }
                            }
                            user: { token: { _eq: $token } }
                        }
                    ) {
                        affected_rows
                    }
                }
            `,
        })
        .then((value: any) => {
            console.log(value);
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
                mutation($id: bigint!, $name: String!, $password: String!) {
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

export async function updateCircle(
    id: number,
    name: string,
    password: string,
    newPassword: string
) {
    return await client
        .mutate({
            variables: {
                id,
                name,
                password,
                newPassword,
            },
            mutation: gql`
                mutation(
                    $id: bigint!
                    $name: String!
                    $password: String!
                    $newPassword: String!
                ) {
                    update_circles(
                        where: {
                            id: { _eq: $id }
                            name: { _eq: $name }
                            password: { _eq: $password }
                        }
                        _set: { password: $newPassword }
                    ) {
                        affected_rows
                    }
                }
            `,
        })
        .then((value: any) => {
            console.log(value);
            return value;
        });
}

export async function getAllUserComments(accessToken: string) {
    return await client
        .query({
            variables: {
                accessToken,
            },
            query: gql`
                query($accessToken: String!) {
                    comments(
                        where: {
                            user: { token: { _eq: $accessToken } }
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
                    $parentId: bigint
                    $circleId: bigint
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
            console.log(data?.insert_comments?.returning?.[0]);
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
                mutation($userId: String!, $vote: Int!, $commentId: bigint!) {
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
                mutation($commentId: bigint!, $userId: String!) {
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
        .then(({ data }: any) => {
            console.log(data?.update_comments?.returning?.[0]);
            return data?.update_comments?.returning?.[0];
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

export async function getCommentsByCircleId(url: string, circleId?: number) {
    return await client
        .query({
            variables: { url, circleId },
            query: gql`
                query($url: String!, $circleId: bigint) {
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
