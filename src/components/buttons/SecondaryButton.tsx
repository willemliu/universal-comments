import React from 'react';
import { ButtonProps } from './buttons';
import styles from './Buttons.module.scss';

function SecondaryButton(props: ButtonProps) {
    return (
        <button
            className={`${styles.secondaryButton} ${props.className}`}
            title={props.title}
            onClick={props.onClick}
        >
            {props.children}
        </button>
    );
}

export { SecondaryButton };
