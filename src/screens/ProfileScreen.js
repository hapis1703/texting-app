/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react/no-unstable-nested-components */
/* eslint-disable react-hooks/exhaustive-deps */
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  TextInput,
  Modal,
  ScrollView,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {Icon} from 'react-native-elements';
import auth from '@react-native-firebase/auth';
import {useDispatch} from 'react-redux';
import {userSignOut} from '../../store/reducer/user';
import {Button} from '../components/ChatComponents';
import ImagePicker from 'react-native-image-crop-picker';
import storage from '@react-native-firebase/storage';
import database from '@react-native-firebase/database';
import Toast from 'react-native-simple-toast';

/**
 * Profile screen component
 *
 * @param {Object} navigation navigation prop provided by react-navigation
 * @returns {JSX.Element} Profile screen component
 */
const ProfileScreen = ({navigation}) => {
  // Redux store dispatch function
  const dispatch = useDispatch();
  // Current user from Firebase auth
  const user = auth().currentUser;
  const [completeUser, setCompleteUser] = useState({});
  const [completeUserB, setCompleteUserB] = useState({});
  // State to control visibility of logout button
  const [isLogOutVisible, setLogOutVisible] = useState(false);
  // State to control visibility of profile change button
  const [isUserEdit, setIsUserEdit] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [editDesc, setEditDesc] = useState(false);

  // Set the header of the screen
  useEffect(() => {
    // Set the header of the screen
    navigation.setOptions({
      headerLeft: () => (
        <TouchableOpacity onPress={() => navigation.navigate('Home')}>
          <View style={styles.iconContainer}>
            <Icon
              name="arrowleft"
              type="antdesign"
              size={20}
              color="#005418"
              style={styles.iconHeader}
            />
          </View>
        </TouchableOpacity>
      ),
    });
  }, []);

  // Listen for auth changes and sign out if the user is not logged in
  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged(userd => {
      if (!userd) {
        dispatch(userSignOut());
      }
    });

    return unsubscribe;
  });

  useEffect(() => {
    getUser();
  }, []);

  const getUser = async () => {
    const userPublic = await database()
      .ref(`users/${user.uid}`)
      .once('value')
      .then(snapshot => {
        const value = snapshot.val();
        setCompleteUser(value);
        setCompleteUserB(value);
      });
    return userPublic;
  };

  /**
   * Delete the profile photo from Firebase storage
   *
   * @param {string} url URL of the photo to delete
   * @returns {Promise<void>} Promise that resolves when the photo is deleted
   */
  const deletePhoto = async url => {
    if (user.photoURL) {
      const bucket = await storage().refFromURL(url).delete();
      return bucket;
    }
  };

  /**
   * Change the profile photo
   *
   * @returns {Promise<void>} Promise that resolves when the photo is changed
   */
  const changePhoto = async () => {
    await ImagePicker.openPicker({
      width: 400,
      height: 400,
      cropping: true,
    }).then(async image => {
      Toast.show('Please wait until the process done', 2000);
      let imgName = image.path.substring(image.path.lastIndexOf('/') + 1);
      let ext = imgName.split('.').pop();
      let name = imgName.split('.')[0];
      let newName = name + user.uid + '.' + ext;
      const ref = storage().ref(`profile/${user.uid}/${newName}`);
      await ref.putFile(image.path);
      const url = await ref.getDownloadURL();
      await deletePhoto(user.photoURL);
      await database().ref(`users/${user.uid}`).update({
        photoURL: url,
      });
      await user.updateProfile({
        photoURL: url,
      });
      Toast.show('Your profile has been updated');
    });
  };

  /**
   * Log the user out
   *
   * @returns {void} No return value
   */
  const LoggedOut = () => {
    auth().signOut();
    dispatch(userSignOut());
  };

  const handleChangeDesc = async () => {
    await database().ref(`users/${user.uid}`).update({
      info: completeUser.info,
    });
    setCompleteUserB({...completeUserB, info: completeUser.info});
    Toast.show('Your profile has been updated', 2000);
  };

  useEffect(() => {
    if (completeUser.info !== completeUserB.info) {
      setEditDesc(true);
    } else {
      setEditDesc(false);
    }
  });

  /**
   * Change the username of the user
   *
   * @returns {Promise<void>} Promise that resolves when the username is changed
   */
  const usernameChange = async () => {
    await user.updateProfile({
      displayName: newUsername,
    });
    await database().ref(`users/${user.uid}`).update({
      usernameId: newUsername,
    });
    setIsUserEdit(false);
    Toast.show('Your profile has been updated', Toast.LONG);
  };

  return (
    <ScrollView style={{flexGrow: 1, backgroundColor: 'white'}}>
      {/* Main container */}
      <View style={styles.mainContainer}>
        {/* Image and Username container */}
        <View style={styles.imageAndUser}>
          {/* Profile image */}
          <TouchableOpacity onLongPress={() => changePhoto()}>
            <Image
              source={
                user.photoURL
                  ? {uri: user.photoURL}
                  : require('../../assets/images/profile.png')
              }
              style={styles.image}
            />
          </TouchableOpacity>
          {/* Username */}
          <View style={styles.usernameContainer}>
            {/* Display username */}
            <Text style={styles.userText}>{user.displayName}</Text>
            {/* Edit button */}
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => setIsUserEdit(true)}>
              <Icon
                name="edit"
                type="entypo"
                size={20}
                color="white"
                style={styles.editIcon}
              />
            </TouchableOpacity>
          </View>
        </View>
        {/* User information */}
        <View style={styles.info}>
          {/* Email */}
          <View style={styles.singleForm}>
            <Text style={styles.subjectForm}>Email</Text>
            <TextInput
              style={styles.formInput}
              placeholder="    yourmail@mail.co"
              placeholderTextColor="black"
              value={`     ${user.email}`}
              editable={false}
              multiline={false}
            />
          </View>
          <View style={styles.singleForm}>
            <Text style={styles.subjectForm}>Info</Text>
            <TextInput
              style={styles.wideInput}
              placeholder="You don't have any info yet"
              placeholderTextColor="grey"
              value={completeUser.info}
              onChangeText={text =>
                setCompleteUser({...completeUser, info: text})
              }
              editable={true}
              multiline={true}
            />
            <TouchableOpacity
              style={[
                styles.changeButton,
                {
                  display: editDesc ? 'flex' : 'none',
                  pointerEvents: editDesc ? 'auto' : 'none',
                },
              ]}
              onPress={() => handleChangeDesc()}>
              <Text style={styles.changeButtonText}>Save Changes</Text>
            </TouchableOpacity>
          </View>
          {/* Logout button */}

          <TouchableOpacity
            style={styles.LogOutButton}
            onPress={() => setLogOutVisible(true)}>
            <Text style={styles.TextLogButton}>Sign Out</Text>
          </TouchableOpacity>
        </View>
        {/* Logout confirmation modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={isLogOutVisible}
          onRequestClose={() => {
            setLogOutVisible(!isLogOutVisible);
          }}>
          <View style={styles.backgroundView}>
            <View style={styles.modalView}>
              <Text style={styles.modalText}>Are you sure want to logout?</Text>
              <View style={styles.modalButton}>
                <Button
                  text="no"
                  isLogout={true}
                  onPress={() => setLogOutVisible(false)}
                />
                <Button text="yes" onPress={() => LoggedOut()} />
              </View>
            </View>
          </View>
        </Modal>
        {/* Username change modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={isUserEdit}
          onRequestClose={() => {
            setIsUserEdit(!isUserEdit);
          }}>
          <View style={styles.backgroundView}>
            <View style={styles.modalView}>
              <Text style={styles.modalText}>Change Username</Text>
              <TextInput
                style={styles.usernameInput}
                value={newUsername}
                onChangeText={text => setNewUsername(text)}
              />
              <View style={styles.modalButton}>
                <Button
                  text="cancel"
                  isLogout={true}
                  onPress={() => setIsUserEdit(false)}
                />
                <Button text="Confirm" onPress={() => usernameChange()} />
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </ScrollView>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  iconContainer: {
    backgroundColor: 'white',
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 15,
    margin: 10,
  },
  mainContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  imageAndUser: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    flex: 1,
    padding: 20,
  },
  image: {
    width: 160,
    height: 160,
    borderWidth: 4,
    borderColor: 'black',
    borderRadius: 100,
  },
  info: {
    flex: 2,
    padding: 20,
  },
  userText: {
    color: 'black',
    fontSize: 30,
    fontWeight: 'bold',
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
  wideInput: {
    height: 200,
    width: '100%',
    backgroundColor: '#CCCCCC',
    borderRadius: 10,
    color: 'black',
    marginTop: 6,
    textAlignVertical: 'top',
    padding: 10,
  },
  singleForm: {
    marginBottom: 20,
  },
  LogOutButton: {
    backgroundColor: '#F87B7B',
    height: 40,
    width: '30%',
    alignItems: 'center',
    alignSelf: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderRadius: 20,
  },
  TextLogButton: {
    color: 'black',
    fontWeight: 'bold',
  },
  changeButton: {
    backgroundColor: '#1f6a05',
    height: 40,
    width: '30%',
    alignItems: 'center',
    alignSelf: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderRadius: 20,
    marginBottom: 10,
    position: 'absolute',
    right: 10,
    bottom: 0,
  },
  changeButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  backgroundView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  modalView: {
    margin: 16,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    borderColor: 'black',
    borderWidth: 3,
    width: '80%',
  },
  modalText: {
    marginTop: 16,
    marginBottom: 16,
    textAlign: 'center',
    fontSize: 16,
    color: 'black',
    fontWeight: 'bold',
  },
  modalButton: {
    flexDirection: 'row',
  },
  usernameContainer: {
    flexDirection: 'row',
    marginTop: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editButton: {
    marginLeft: 10,
    backgroundColor: '#005418',
    padding: 6,
    borderRadius: 100,
  },
  usernameInput: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 10,
    color: 'black',
    marginTop: 6,
    borderWidth: 2,
    borderColor: 'black',
    height: 40,
  },
  enter: {
    backgroundColor: '#005418',
    alignSelf: 'center',
    alignItems: 'center',
    borderRadius: 100,
    padding: 3,
    marginLeft: 5,
  },
  editIcon: {
    margin: 2,
  },
});
