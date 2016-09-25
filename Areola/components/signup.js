import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput
} from 'react-native';
import Meteor, { Accounts } from 'react-native-meteor';
import Button from 'apsl-react-native-button';
import ReactTimeout from 'react-timeout';
import KeyboardSpacer from 'react-native-keyboard-spacer';
import Background from './background';

class Signup extends Component {

  constructor(props) {
    super(props);
    this.state = {
      username: '',
      email: '',
      password: '',
      message: null,
      status: null
    }
  }

  createAccount() {
    Accounts.createUser(Object.assign({}, this.state), (error) => {
      if (error) {
        return this.setState({status: 'error', message: error.reason});
      }
      Meteor.loginWithPassword({email: this.state.email}, this.state.password, (error) => {
        if (error) {
          return this.setState({status: 'error', message: error.reason});
        }
      });
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
        {this.signupForm()}
      </View>
    );
  }

  signupForm() {
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
            placeholder='Username'
            placeholderTextColor='white'
            style={styles.input}
            onChangeText={(username) => this.setState({username})}
            value={this.state.username}
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
          />
        </View>
        <Button
          style={styles.button}
          textStyle={styles.buttonText}
          onPress={this.createAccount.bind(this)}
        >
          Sign up
        </Button>
        <KeyboardSpacer/>
      </View>
    );
  }

}

export default ReactTimeout(Signup);

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
    borderWidth: 0,
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
});
