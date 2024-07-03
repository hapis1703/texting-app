/* eslint-disable no-useless-escape */
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {Icon} from 'react-native-elements';
import auth from '@react-native-firebase/auth';
import Toast from 'react-native-simple-toast';
import database from '@react-native-firebase/database';
import {useDispatch} from 'react-redux';
import {userSignIn} from '../../store/reducer/user';

/**
 * RegisterScreen component
 *
 * Component for the register screen of the app.
 * This screen is used to register a new user to the app.
 */
const RegisterScreen = ({navigation}) => {
  /**
   * username: string
   *
   * State variable to hold the username input by the user
   */
  const [username, setUsername] = useState('');

  /**
   * email: string
   *
   * State variable to hold the email input by the user
   */
  const [email, setEmail] = useState('');

  /**
   * password: string
   *
   * State variable to hold the password input by the user
   */
  const [password, setPassword] = useState('');

  /**
   * isPassVisible: boolean
   *
   * State variable to determine if the password input should be visible
   */
  const [isPassVisible, setIsPassVisible] = useState(false);

  /**
   * dispatch: function
   *
   * Function to dispatch an action to the Redux store
   */
  const dispatch = useDispatch();

  /**
   * handleSignUp: function
   *
   * Function to handle the user registration process
   * This function is called when the user presses the 'Register' button
   */
  const handleSignUp = async () => {
    /**
     * emailRegex: RegExp
     *
     * Regular expression to validate the email address input by the user
     */
    const emailRegex =
      /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;

    /**
     * If the user did not fill out all the fields or the email is not valid
     */
    if (
      email === '' ||
      username === '' ||
      password === '' ||
      !emailRegex.test(email)
    ) {
      /**
       * Show a toast telling the user to fill out all the fields and enter a valid email address
       */
      Toast.show('Please fill all the fields and enter a valid email address');
    } else {
      /**
       * Try to register the user with the given email and password
       */
      await auth()
        .createUserWithEmailAndPassword(email, password)
        .then(async userCredential => {
          /**
           * Store the user's information in the database
           */
          const user = userCredential.user;

          await database().ref(`/users/${user.uid}`).set({
            usernameId: username,
            uid: user.uid,
            info: "Hello, I'm using Messenger X",
          });

          /**
           * Update the user's display name
           */
          user.updateProfile({
            displayName: username,
          });

          /**
           * Show a toast telling the user that the registration was successful
           */
          Toast.show('User created successfully');
        })
        .catch(error => {
          /**
           * If the error is that the email is already in use
           */
          if (error.code === 'auth/email-already-in-use') {
            /**
             * Show a toast telling the user that the email is already in use
             */
            Toast.show('Email already in use');
          } else if (error.code === 'auth/invalid-email') {
            /**
             * If the error is that the email is invalid
             */
            /**
             * Show a toast telling the user that the email is invalid
             */
            Toast.show('Invalid email address');
          } else if (error.code === 'auth/weak-password') {
            /**
             * If the error is that the password is too weak
             */
            /**
             * Show a toast telling the user that the password is too weak
             */
            Toast.show('Password must be at least 6 characters');
          } else {
            /**
             * If the error is something else
             */
            /**
             * Log the error to the console
             */
            console.error(error);

            /**
             * Show a toast telling the user that something went wrong
             */
            Toast.show('Something went wrong');
          }
        });
    }
  };

  /**
   * useEffect: function
   *
   * Function to run the effect after the component is rendered
   * This function is used to listen for changes in the user's authentication state
   */
  useEffect(() => {
    /**
     * unsubscribe: function
     *
     * Function to unsubscribe from the authentication state change listener
     * This function is called when the component is unmounted
     */
    const unsubscribe = auth().onAuthStateChanged(user => {
      /**
       * If the user is logged in
       */
      if (user) {
        /**
         * Dispatch an action to the Redux store to update the user's authentication state
         */
        dispatch(userSignIn());
      }
    });

    /**
     * Return the unsubscribe function
     * This function will be called when the component is unmounted
     */
    return unsubscribe;
  });

  return (
    <ScrollView contentContainerStyle={styles.scroll}>
      <View style={styles.viewContainer}>
        <Text style={styles.judulScreen}>REGISTER</Text>
        <View style={styles.mainContainer}>
          <View style={styles.formContainer}>
            <View style={styles.singleForm}>
              <Text style={styles.subjectForm}>Username</Text>
              <TextInput
                style={styles.formInput}
                placeholder="    YourName"
                placeholderTextColor="black"
                value={username}
                onChangeText={text => setUsername(text)}
              />
            </View>
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
            <View style={styles.singleForm}>
              <Text style={styles.subjectForm}>Password</Text>
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
          <View style={styles.ActionCenter}>
            <TouchableOpacity
              style={styles.RegButton}
              onPress={() => handleSignUp()}>
              <Text style={styles.TextButton}>REGISTER</Text>
            </TouchableOpacity>
            <View style={styles.navigationCenter}>
              <Text style={styles.normalText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.navigateText}>Login</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};
export default RegisterScreen;

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
});
