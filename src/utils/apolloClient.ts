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
                query($accessToken: String!) {
                    circles(
                        where: {
                            users_circles: {
                                user: { token: { _eq: $accessToken } }
                            }
                        }
                    ) {
                        id
                        name
                        password
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
                console.log(value?.data?.insert_circles?.returning?.[0]);
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

export async function removeCircle(id: number, name: string, password: string) {
    client
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
            console.log(value?.data);
            window.location.reload();
        })
        .catch((err) => {
            console.error(err);
            alert(
                `Couldn't remove the [${name}] circle. Please notify the administrator of this error.`
            );
        });
}

export async function updateCircle(
    id: number,
    name: string,
    password: string,
    newPassword: string
) {
    client
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
            console.log(value?.data);
            window.location.reload();
        })
        .catch((err) => {
            console.error(err);
            alert(
                `Couldn't save changes for the [${name}] circle. Please notify the administrator of this error.`
            );
        });
}
