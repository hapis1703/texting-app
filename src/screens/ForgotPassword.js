import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import React, {useState} from 'react';
import auth from '@react-native-firebase/auth';
import Toast from 'react-native-simple-toast';

/**
 * ForgotPassword component
 *
 * Displays a form for users to input their email address and submit it to request a password reset.
 * When the user submits the form, it sends a password reset email to their email address if it is valid.
 * It then navigates the user back to the login screen.
 *
 * @param {Object} navigation - The navigation object from react-navigation.
 */
const ForgotPassword = ({navigation}) => {
  /**
   * email: string
   *
   * The email address entered by the user.
   */
  const [email, setEmail] = useState('');

  /**
   * handleResetPassword: function
   *
   * Handles the password reset process.
   * Checks if the email field is empty and displays a toast message if it is.
   * If the email field is not empty, it sends a password reset email to the user's email address.
   * If the email is not valid, it displays a toast message indicating the error.
   * If the email is valid, it displays a toast message indicating the success of the password reset request.
   * It then navigates the user back to the login screen.
   */
  const handleResetPassword = async () => {
    // Check if email field is empty and display a toast message if it is
    if (email === '') {
      Toast.show('Please input your Email', 2000);
    } else {
      // Send password reset email to the user's email address
      await auth()
        .sendPasswordResetEmail(email)
        .then(() => {
          // Display success message and reset email field
          Toast.show('Check your email to confirm reset password!');
          setEmail('');
          // Navigate back to the login screen
          navigation.navigate('Login');
        })
        .catch(error => {
          // Display error message based on the Firebase error code
          if (error.code === 'auth/invalid-email') {
            Toast.show('Invalid email', 2000);
          } else if (error.code === 'auth/user-not-found') {
            Toast.show('User Not Found', 2000);
          } else {
            Toast.show('Something went wrong', 2000);
          }
        });
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scroll}>
      <View style={styles.viewContainer}>
        <Text style={styles.judulScreen}>RESET PASSWORD</Text>
        <View style={styles.mainContainer}>
          <View style={styles.formContainer}>
            <View style={styles.singleForm}>
              <Text style={styles.subjectForm}>Email</Text>
              {/* Input field for email */}
              <TextInput
                style={styles.formInput}
                placeholder="    Input your email"
                placeholderTextColor="black"
                value={email}
                onChangeText={text => setEmail(text)}
                keyboardType="email-address"
              />
            </View>
          </View>
          <View style={styles.ActionCenter}>
            {/* Button to submit the email for password reset */}
            <TouchableOpacity
              style={styles.RegButton}
              onPress={() => handleResetPassword()}>
              <Text style={styles.TextButton}>Send Confirmation</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default ForgotPassword;

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
    marginTop: 10,
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
