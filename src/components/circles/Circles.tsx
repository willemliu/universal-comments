import React, { useState } from 'react';
import {
    removeCircle,
    updateCircle,
    leaveCircle,
} from '../../utils/apolloClient';
import UserStore from '../../stores/UserStore';
import styles from './Circles.module.css';

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
        console.debug(e);
        if (confirm(`Remove [${name}] circle and all related comments?`)) {
            try {
                removeCircle(id, name, password).then(() => {
                    window.location.reload();
                });
            } catch (err) {
                console.error(err);
                alert(
                    `Couldn't remove the [${name}] circle. Please notify the administrator of this error.`
                );
            }
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
        console.debug(e);
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
                try {
                    updateCircle(id, name, password, newPassword).then(() => {
                        window.location.reload();
                    });
                } catch (err) {
                    console.error(err);
                    alert(
                        `Couldn't save changes for the [${name}] circle. Please notify the administrator of this error.`
                    );
                }
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

    function handleLeave(name: string, password: string) {
        try {
            leaveCircle(UserStore.getToken(), name, password)
                .then(() => {
                    // window.location.reload();
                })
                .catch((err) => {
                    alert(`${err}`);
                });
        } catch (err) {
            console.error(err);
            alert(
                `Couldn't leave the [${name}] circle. Please notify the administrator of this error.`
            );
        }
    }

    return (
        <table className={styles.circles}>
            <tr>
                <th>Circle name</th>
                <th>Password</th>
                <th>Remove</th>
                <th>Leave</th>
            </tr>

            {props.circles.map((circle: Circle) => (
                <tr key={circle.name}>
                    <td>
                        <label>{circle.name}</label>
                    </td>
                    <td>
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
                    </td>
                    <td>
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
                    </td>
                    <td>
                        <button
                            onClick={handleLeave.bind(
                                null,
                                circle.name,
                                circle.password
                            )}
                            title="Leave"
                        >
                            🏃💨
                        </button>
                    </td>
                </tr>
            ))}
        </table>
    );
}

export { Circles };
