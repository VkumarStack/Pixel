import React from "react";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from './firebase';
import '../css/SignIn.css';

const provider = new GoogleAuthProvider();

class SignIn extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            show: false,
            errorMessage: false
        };
    }
    
    handleSubmit(e) {
        e.preventDefault();
        signInWithPopup(auth, provider)
            .catch((error) => {
                this.setState({errorMessage: true});
                setTimeout(() => {this.setState({errorMessage: false})}, 5000);
            });
        
    }

    render() {
        return (
            <div className="SignIn">
                <div className="sign-in-button button" onClick={this.handleSubmit}> Sign In </div>
            </div>
        );
    }
}

export default SignIn;