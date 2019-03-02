import React from 'react';
import ReactDOM from 'react-dom';

const HomestuckReference = props => {
    return <marquee>{props.message}</marquee>;
};

ReactDOM.render(<HomestuckReference message='This is the beginning of something really excellent.' />, document.getElementById('root'));
