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
        setReadOnly(!readOnly);
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
                        title={readOnly ? 'Read only' : 'Editable'}
                    >
                        {readOnly ? `🔐` : `🔓`}
                    </button>
                    <button
                        onClick={handleDelete.bind(null, circle.name)}
                        title="Delete"
                    >
                        🗑️
                    </button>
                </li>
            ))}
        </ul>
    );
}

export { Circles };
