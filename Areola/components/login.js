import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
} from 'react-native';
import Meteor, { Accounts } from 'react-native-meteor';
import Button from 'apsl-react-native-button';
import ReactTimeout from 'react-timeout';
import KeyboardSpacer from 'react-native-keyboard-spacer';
import Background from './background';

class Login extends Component {
  componentWillMount() {
    this.setState(this.props);
  }

  componentDidMount() {
      if (this.props.email && this.props.password) {
        this.logIn();
      }
  }

  constructor() {
    super();

    this.state = {
      email: '',
      password: '',
      message: null,
      status: null
    }
  }

  logIn() {
    Meteor.loginWithPassword({email: this.state.email}, this.state.password, (error) => {
      if (error) {
        return this.setState({status: 'error', message: error.reason});
      }
    });
  }

  clearMessage() {
    this.setState({status: null, message: null});
  }

  showMessage() {
    if (this.state.message) {
      this.props.setTimeout(this.clearMessage.bind(this), 3000);
    }
    return !this.state.message ? null : (
      <View style={styles.message}>
        <Text style={styles.messageText}>{this.state.message}</Text>
      </View>
    );
  }
  render() {
    return (
      <View style={styles.container}>
        <Background />
        {this.loginForm()}
      </View>);
  }

  signup() {
    this.props.navigator.push({name: 'signup'});
  }

  loginForm() {
    return (
      <View style={styles.formContainer}>
        <View style={styles.title}>
          <Text style={styles.titleText}>Areola</Text>
          {this.showMessage.apply(this)}
        </View>
        <View style={styles.inputContainer}>
          <TextInput
            placeholder='Email'
            placeholderTextColor='white'
            keyboardType='email-address'
            style={styles.input}
            onChangeText={(email) => this.setState({email})}
            value={this.state.email}
            autoCorrect={false}
          />
        </View>
        <View style={styles.inputContainer}>
          <TextInput
            placeholder='Password'
            placeholderTextColor='white'
            password={true}
            style={styles.input}
            onChangeText={(password) => this.setState({password})}
            value={this.state.password}
            autoCorrect={false}
          />
        </View>
        <Button
          style={styles.button}
          textStyle={styles.buttonText}
          onPress={this.logIn.bind(this)}
        >
          Log in
        </Button>
        <View style={styles.signup}>
          <Button
            style={styles.signupButton}
            textStyle={styles.signupText}
            onPress={this.signup.bind(this)}
          >
            Create new account
          </Button>
        </View>
        <KeyboardSpacer/>
      </View>
    );
  }
}

export default ReactTimeout(Login);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'stretch',
    justifyContent: 'center',
    backgroundColor: 'white'
  },
  formContainer: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'stretch',
    justifyContent: 'center',
    margin: 20,
    backgroundColor: 'transparent'
  },
  input: {
    textAlign: 'left',
    height: 20,
    marginBottom: 2,
    marginTop: 20,
    color: 'white',
    fontSize: 14,
    borderWidth: 0,
  },
  inputContainer: {
    borderBottomWidth: 1,
    borderBottomColor: 'white',
  },
  button: {
    borderWidth: 0  ,
    backgroundColor: '#3498aa',
    height: 50,
    margin: 10,
    marginTop: 30,
    padding: 15,
    borderRadius: 0
  },
  buttonText: {
    color: 'white'
  },
  message: {
    backgroundColor: 'red',
    height: 30,
    padding: 3,
    opacity: 0.4,
    position: 'absolute',
    top: 50,
    left: 5,
    bottom: 0,
    right: 5,
  },
  messageText: {
    textAlign: 'center',
    fontSize: 11,
    fontWeight: 'bold'
  },
  title: {
    backgroundColor: 'transparent',
    height: 60,
    margin: 10,
    borderWidth: 0,
  },
  titleText: {
    textAlign: 'center',
    marginTop: 10,
    backgroundColor: 'transparent',
    fontSize: 34,
    color: '#222222',
    fontWeight: 'bold',
    textShadowColor: '#4d4d4d',
    textShadowRadius: 2,
    textShadowOffset: {
      width: 2,
      height: 2
    },
    opacity: 0.8
  },
  signup: {
    backgroundColor: 'transparent',
    padding: 0
  },
  signupButton: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    padding: 0,
    margin: 0,
  },
  signupText: {
    textAlign: 'right',
    color: 'white',
    fontSize: 13
  },
});
