import React from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from './firebase';
import '../css/SignIn.css';

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
        signInWithEmailAndPassword(auth, e.target.email.value, e.target.password.value)
            .catch((error) => {
                this.setState({errorMessage: true});
                setTimeout(() => {this.setState({errorMessage: false})}, 5000);
            });
        
    }

    render() {
        return (
            <div className="SignIn">
                <div className="sign-in-button button" onClick={() => this.setState({show: !this.state.show})}> Sign In </div>
                { this.state.show && 
                
                    <form onSubmit={ (e) => { this.handleSubmit(e) } }>
                        <div className="form-container">
                            <div className="form-pair">
                                <label htmlFor="Email">Email</label>
                                <input type="text" id="Email" name="email"/>
                            </div>
                            <div className="form-pair">
                                <label htmlFor="Password">Password</label>
                                <input type="password" id="Password" name="password"/>
                            </div>
                            <button type="submit"> Sign In</button>
                            { this.state.errorMessage &&
                                <h1> Incorrect Credentials </h1>
                            }
                        </div>
                    </form>
                }
            </div>
        );
    }
}

export default SignIn;