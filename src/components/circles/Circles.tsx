import React from 'react';

type Circle = {
    name: string;
};

interface Props {
    circles: any[];
}

function Circles(props: Props) {
    function handleDelete(name, e: React.MouseEvent<HTMLButtonElement>) {
        if (confirm(`Remove [${name}] circle and all related comments?`)) {
            console.log(e, name);
        }
    }

    return (
        <ul>
            {props.circles.map((circle: Circle) => (
                <li key={circle.name}>
                    {circle.name}{' '}
                    <button onClick={handleDelete.bind(null, circle.name)}>
                        [x]
                    </button>
                </li>
            ))}
        </ul>
    );
}

export { Circles };
