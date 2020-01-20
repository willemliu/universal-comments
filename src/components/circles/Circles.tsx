import React, { useState } from 'react';

type Circle = {
    name: string;
    password: string;
};

interface Props {
    circles: any[];
}

function Circles(props: Props) {
    const [readOnly, setReadOnly] = useState(true);

    function handleDelete(name, e: React.MouseEvent<HTMLButtonElement>) {
        if (confirm(`Remove [${name}] circle and all related comments?`)) {
            console.log(e, name);
        }
    }

    function handlePwClick(e: React.MouseEvent<HTMLInputElement>) {
        e.currentTarget.select();
    }

    function toggleReadOnly() {
        if (
            confirm(
                readOnly
                    ? 'Are you sure you want to change the password? Other members will be removed from the circle and you have to re-invite manually.'
                    : `Are you sure to save any changes you may have made? If you are unsure and want to revert then press Cancel and reload this page.`
            )
        ) {
            setReadOnly(!readOnly);
        }
    }

    return (
        <ul>
            {props.circles.map((circle: Circle) => (
                <li key={circle.name}>
                    <label>{circle.name}</label>
                    <span> - </span>
                    <input
                        type="text"
                        onClick={handlePwClick}
                        defaultValue={circle.password}
                        readOnly={readOnly}
                        title="password"
                    />
                    <button
                        onClick={toggleReadOnly}
                        title={readOnly ? 'Read only' : 'Save changes'}
                    >
                        {readOnly ? `🔐` : `💾`}
                    </button>
                    <button
                        onClick={handleDelete.bind(null, circle.name)}
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
