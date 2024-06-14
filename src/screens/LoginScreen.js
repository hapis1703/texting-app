/* eslint-disable no-useless-escape */
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StyleSheet,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {Icon} from 'react-native-elements';
import auth from '@react-native-firebase/auth';
import Toast from 'react-native-simple-toast';
import {useDispatch} from 'react-redux';
import {userSignIn} from '../../store/reducer/user';

/**
 * LoginScreen component
 *
 * Displays a login form for the user to enter their email and password.
 * Handles login functionality and displays error messages based on the Firebase error code.
 * Navigates to the register screen if the user does not have an account.
 */
const LoginScreen = ({navigation}) => {
  // Email and password inputs
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // Toggle for password visibility
  const [isPassVisible, setIsPassVisible] = useState(false);
  // Dispatch function to update user state in the Redux store
  const dispatch = useDispatch();

  /**
   * Handles login functionality
   * Checks if the email and password inputs are valid
   * If they are, attempts to sign in with the provided credentials
   * If not, displays an error message based on the Firebase error code
   */
  const handleSignIn = async () => {
    // Regex for email validation
    const emailRegex =
      /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
    // If the inputs are not valid, display an error message
    if (email === '' || password === '' || !emailRegex.test(email)) {
      Toast.show('Please enter valid email and password', Toast.SHORT);
      // If the inputs are valid, attempt to sign in
    } else {
      await auth()
        .signInWithEmailAndPassword(email, password)
        .then(() => {
          Toast.show('Login Successful', Toast.SHORT);
        })
        .catch(error => {
          // Display error message based on the Firebase error code
          switch (error.code) {
            case 'auth/user-not-found':
              Toast.show('User not found', Toast.SHORT);
              break;
            case 'auth/user-disabled':
              Toast.show('User is disabled', Toast.SHORT);
              break;
            case 'auth/email-already-in-use':
              Toast.show('Email already in use', Toast.SHORT);
              break;
            case 'auth/wrong-password':
              Toast.show('Wrong Password', Toast.SHORT);
              break;
            case 'auth/invalid-email':
              Toast.show('Invalid Email', Toast.SHORT);
              break;
            case 'auth/invalid-credential':
              Toast.show('Invalid Credential', Toast.SHORT);
              break;
            default:
              Toast.show('Something went wrong', Toast.SHORT);
          }
        });
    }
  };

  /**
   * Listens for changes in the user's authentication state
   * If the user is signed in, updates the user's state in the Redux store
   */
  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged(user => {
      if (user) {
        dispatch(userSignIn());
      }
    });
    return unsubscribe;
  }, [dispatch]);

  return (
    // Scrollable container
    <ScrollView contentContainerStyle={styles.scroll}>
      <View style={styles.viewContainer}>
        <Text style={styles.judulScreen}>LOGIN</Text>
        {/* Main container */}
        <View style={styles.mainContainer}>
          {/* Form container */}
          <View style={styles.formContainer}>
            {/* Email input */}
            <View style={styles.singleForm}>
              <Text style={styles.subjectForm}>Email</Text>
              <TextInput
                style={styles.formInput}
                placeholder="    yourmail@mail.co"
                placeholderTextColor="black"
                value={email}
                onChangeText={text => setEmail(text)}
                keyboardType="email-address"
              />
            </View>
            {/* Password input */}
            <View style={styles.singleForm}>
              <View style={styles.passwordHead}>
                <Text style={styles.subjectForm}>Password</Text>
                <TouchableOpacity
                  onPress={() => navigation.navigate('ForgotP')}>
                  <Text style={styles.navigateText}>Forgot Password?</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.formInput}
                  placeholder="    (Min. 6 Characters)"
                  placeholderTextColor="black"
                  value={password}
                  onChangeText={text => setPassword(text)}
                  secureTextEntry={isPassVisible ? false : true}
                />
                <View style={styles.iconContainer}>
                  <TouchableOpacity
                    onPress={() => setIsPassVisible(!isPassVisible)}>
                    <Icon
                      name={isPassVisible ? 'eye' : 'eye-off'}
                      type="ionicon"
                      size={22}
                      style={styles.icon}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
          {/* Action center */}
          <View style={styles.ActionCenter}>
            <TouchableOpacity
              style={styles.RegButton}
              onPress={() => handleSignIn()}>
              <Text style={styles.TextButton}>LOGIN</Text>
            </TouchableOpacity>
            {/* Navigation center */}
            <View style={styles.navigationCenter}>
              <Text style={styles.normalText}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text style={styles.navigateText}>Register</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 1,
  },
  viewContainer: {
    flex: 1,
    backgroundColor: '#005418',
    alignItems: 'center',
  },
  judulScreen: {
    fontSize: 60,
    fontFamily: '',
    fontWeight: 'bold',
    flex: 1,
    marginTop: 50,
    marginBottom: 30,
    color: 'white',
    textAlign: 'center',
  },
  mainContainer: {
    width: '100%',
    backgroundColor: 'white',
    flex: 10,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
  },
  formContainer: {
    alignItems: 'left',
    marginTop: 50,
    marginLeft: 15,
    marginRight: 15,
  },
  subjectForm: {
    color: 'black',
    marginLeft: 20,
    fontWeight: 'bold',
    fontSize: 15,
  },
  formInput: {
    width: '100%',
    backgroundColor: '#CCCCCC',
    borderRadius: 40,
    color: 'black',
    marginTop: 6,
  },
  singleForm: {
    marginBottom: 20,
  },
  ActionCenter: {
    alignItems: 'center',
    width: '100%',
    marginBottom: 10,
  },
  RegButton: {
    width: '80%',
    backgroundColor: '#00AD11',
    padding: 18,
    alignItems: 'center',
    borderRadius: 100,
    marginTop: 50,
  },
  TextButton: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 17,
  },
  navigationCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '80%',
    marginTop: 10,
    justifyContent: 'center',
  },
  normalText: {
    color: 'black',
    fontWeight: 'bold',
    fontSize: 15,
    textAlign: 'center',
  },
  navigateText: {
    color: '#03A400',
    fontWeight: 'bold',
    fontSize: 15,
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconContainer: {
    padding: 0,
    position: 'absolute',
    right: 15,
    justifyContent: 'center',
    alignItems: 'center',
    bottom: 12,
  },
  passwordHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
