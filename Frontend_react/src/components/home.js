import React, {Component} from "react";
import history from '../history';
import "./home.css";

class Home extends Component{
    render() {
        return(
            <div className="container-fluid">
                <div className="page-header">
                    <h1 className="appname">MIMO</h1>
                </div>
                <div className="row">
                    <div className="col">
                        <h5 className="subheading">Play with your face</h5>
                        <p>Upload an image and make desired changes.</p>
                        <p> Try it yourself !</p>
                        <button type="button" className="btn btn-outline-light getstarted" onClick={() => history.push('/Upload')}>
                            Get Started
                        </button>
                        <button type="button" className="btn btn-outline-light getstarted" onClick={() => history.push('/webcam')}>
                            Webcam
                        </button>
                    </div>
                    <div className="col">
                        Add another button for home page
                    </div>
                </div>      
            </div>
        );
    }
}

export default Home;