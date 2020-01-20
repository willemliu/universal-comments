import React, { useState } from 'react';
import { getApolloClient } from '../../utils/apolloClient';
import { gql } from 'apollo-boost';

type Circle = {
    id: number;
    name: string;
    password: string;
};

interface Props {
    circles: any[];
}

function Circles(props: Props) {
    const [newPassword, setNewPassword] = useState(null);
    const [readOnly, setReadOnly] = useState(true);

    function handleDelete(
        id: number,
        name: string,
        password: string,
        e: React.MouseEvent<HTMLButtonElement>
    ) {
        if (confirm(`Remove [${name}] circle and all related comments?`)) {
            const client = getApolloClient();
            client
                .mutate({
                    variables: {
                        id,
                        name,
                        password,
                    },
                    mutation: gql`
                        mutation MyMutation(
                            $id: bigint!
                            $name: String!
                            $password: String!
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
                    console.log(value?.data);
                    window.location.reload();
                })
                .catch((err) => {
                    console.error(e, err);
                    alert(
                        `Couldn't remove the [${name}] circle. Please notify the administrator of this error.`
                    );
                });
        }
    }

    function handlePwClick(e: React.MouseEvent<HTMLInputElement>) {
        e.currentTarget.select();
    }

    function toggleReadOnly(
        id: number,
        name: string,
        password: string,
        e: React.MouseEvent<HTMLButtonElement>
    ) {
        if (
            confirm(
                readOnly
                    ? 'Are you sure you want to change the password?'
                    : `Are you sure to save any changes you may have made? Pressing Cancel will reload this page and revert your changes.`
            )
        ) {
            setReadOnly(!readOnly);

            // Store the changes when user clicks save.
            if (!readOnly && newPassword) {
                const client = getApolloClient();
                client
                    .mutate({
                        variables: {
                            id,
                            name,
                            password,
                            newPassword,
                        },
                        mutation: gql`
                            mutation MyMutation(
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
                        console.error(e, err);
                        alert(
                            `Couldn't save changes for the [${name}] circle. Please notify the administrator of this error.`
                        );
                    });
            }
        } else {
            // If in edit mode we do a page reload after user cancels the Save. We assume the user does not want to save the changes and we revert it for the user.
            if (!readOnly) {
                window.location.reload();
            }
        }
    }

    function handlePasswordChange(e: React.ChangeEvent<HTMLInputElement>) {
        setNewPassword(e.currentTarget.value);
    }

    return (
        <ul>
            {props.circles.map((circle: Circle) => (
                <li key={circle.name}>
                    <label>{circle.name}</label>
                    <span> - </span>
                    <input
                        type="text"
                        onChange={handlePasswordChange}
                        onClick={handlePwClick}
                        defaultValue={circle.password}
                        readOnly={readOnly}
                        title="password"
                    />
                    <button
                        onClick={toggleReadOnly.bind(
                            null,
                            circle.id,
                            circle.name,
                            circle.password
                        )}
                        title={readOnly ? 'Read only' : 'Save changes'}
                    >
                        {readOnly ? `🔐` : `💾`}
                    </button>
                    <button
                        onClick={handleDelete.bind(
                            null,
                            circle.id,
                            circle.name,
                            circle.password
                        )}
                        title="Delete"
                    >
                        ☠️
                    </button>
                </li>
            ))}
        </ul>
    );
}

export { Circles };
