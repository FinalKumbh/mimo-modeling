import React, { Component } from "react";
import { Router, Switch, Route } from "react-router-dom";
import Webcam from "react-webcam";
import Webcam_picture from "./components/camera";

import Home from "./components/home"
import Upload from "./components/upload"
import history from './history';

export default class Routes extends Component {
    render() {
        return (
            <Router history={history}>
                <Switch>
                    <Route path="/" exact component={Home} />
                    <Route path="/Upload" component={Upload} />
                    <Route path="/webcam" component={Webcam_picture} />
                </Switch>
            </Router>
        )
    }
}