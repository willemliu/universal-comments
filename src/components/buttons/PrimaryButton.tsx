import React from 'react';
import { ButtonProps } from './buttons';
import styles from './Buttons.module.scss';

function PrimaryButton(props: ButtonProps) {
    return (
        <button
            className={`${styles.primaryButton} ${props.className}`}
            title={props.title}
            onClick={props.onClick}
        >
            {props.children}
        </button>
    );
}

export { PrimaryButton };
