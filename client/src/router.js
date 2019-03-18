import React from 'react';
import { escapeRegExp } from './util.js';

export class Router extends React.Component {
    constructor(props) {
        super(props);
        this._routeChange = this._routeChange.bind(this);
        this.state = { active: this._resolve() };
    }

    componentDidMount() {
        window.addEventListener('route-change', this._routeChange);
    }

    componentWillUnmount() {
        window.removeEventListener('route-change', this._routeChange);
    }

    render() {
        return this.state.active;
    }

    _routeChange() {
        this.setState({ active: this._resolve() });
    }

    _resolve() {
        let path = decodeURIComponent(location.pathname);

        for (let key in this.props.routes) {
            let match = new RegExp('^' + key + '$').exec(path);
            if (match) return this.props.routes[key](...match);
        }

        return this.props.fallback(path);
    }
}

export function Link(props) {
    let { onClick: oldOnClick, ...rest } = props;

    let onClick = e => {
        e.preventDefault();
        navigate(props.href);
        if (oldOnClick) oldOnClick(e);
    };

    return <a {...rest} onClick={onClick} />;
}

export function NavLink(props) {
    let { activeClassName, ...rest } = props;

    let on = () => <Link {...rest} className={activeClassName} />;
    let off = () => <Link {...rest} />;

    return <Router routes={{ [escapeRegExp(props.href) + '(/.*)?']: on }}
                   fallback={off} />;
}

export function navigate(href) {
    history.pushState(null, null, href);
    window.dispatchEvent(new Event('route-change'));
}

window.addEventListener('popstate', () => {
    window.dispatchEvent(new Event('route-change'));
});
