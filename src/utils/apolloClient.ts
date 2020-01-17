import 'isomorphic-unfetch';
import ApolloClient, { gql } from 'apollo-boost';

// the Apollo cache is set up automatically
const client = new ApolloClient({
    uri: 'https://universal-comments.herokuapp.com/v1/graphql',
    name: 'hasura-test',
    credentials: 'include',
    headers: {
        'X-Hasura-Role': 'universal-comments',
    },
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

export function createUser(
    id: string,
    name: string,
    email: string,
    image: string,
    token: string
) {
    const client = getApolloClient();
    client
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
