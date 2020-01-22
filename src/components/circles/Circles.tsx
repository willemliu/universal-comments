import React from 'react';
import { removeCircle, leaveCircle } from '../../utils/apolloClient';
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

    function handleLeave(name: string, password: string) {
        try {
            leaveCircle(UserStore.getUuid(), name, password)
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
            <thead>
                <tr>
                    <th>Circle name</th>
                    <th>Password</th>
                    <th>Remove</th>
                    <th>Leave</th>
                </tr>
            </thead>

            <tbody>
                {props.circles.map((circle: Circle) => (
                    <tr key={circle.name}>
                        <td>
                            <label>{circle.name}</label>
                        </td>
                        <td>
                            <label>{circle.password}</label>
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
            </tbody>
        </table>
    );
}

export { Circles };
