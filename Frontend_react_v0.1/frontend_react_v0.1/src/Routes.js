import React, { Component } from "react";
import { Router, Route } from "react-router-dom";
import history from './history';

import { Main } from './container'

export default class Routes extends Component {
    render() {
        return (
            <Router history={history}>
                <Route path="/" exact component={Main} />
            </Router>
        )
    }
}