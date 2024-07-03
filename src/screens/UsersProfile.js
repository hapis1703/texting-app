/* eslint-disable react-native/no-inline-styles */
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
  TextInput,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import database from '@react-native-firebase/database';
import auth from '@react-native-firebase/auth';
import {Button} from '../components/ChatComponents';
/**
 * UsersProfile component
 *
 * Displays the profile of a user with their username and info.
 *
 * @param {Object} route - The route object containing the user's uid.
 * @returns {React.Component} A component displaying the user's profile.
 */
const UsersProfile = ({route}) => {
  // Get the user's uid from the route params
  const uid = route.params.uid;
  const myId = auth().currentUser.uid;
  // Store the user's data in state
  const [user, setUser] = useState({});
  const [isFriend, setIsFriend] = useState(false);
  const [isPending, setIsPending] = useState(false);

  /**
   * Fetches the user's data from Firebase
   * Sets the user's data in state
   */
  const getUser = async () => {
    await database()
      .ref(`users/${uid}`)
      .once('value')
      .then(snapshot => {
        const user = snapshot.val();
        if (user.friends) {
          const users = Object.values(user.friends).filter(item => {
            return item.accepted === true && item.uid === myId;
          });
          const friendPending = Object.values(user.friends).filter(item => {
            return item.ingoing === true || item.outgoing === true;
          });
          if (friendPending.length > 0) {
            setIsPending(true);
          } else {
            setIsPending(false);
          }
          if (users.length > 0) {
            setIsFriend(true);
          } else {
            setIsFriend(false);
          }
        } else {
          setIsFriend(false);
        }
        setUser(user);
      });
  };

  const handleUnfriend = () => {
    database().ref(`users/${myId}/friends/${uid}`).remove();
    database().ref(`users/${uid}/friends/${myId}`).remove();
    setIsFriend(false);
  };

  const handleAddFriend = () => {
    database().ref(`users/${myId}/friends/${uid}`).update({
      accepted: false,
      ingoing: false,
      outgoing: true,
      uid: uid,
    });
    database().ref(`users/${uid}/friends/${myId}`).update({
      accepted: false,
      ingoing: true,
      outgoing: false,
      uid: myId,
    });
    setIsPending(true);
  };

  // Fetch the user's data when the component mounts
  useEffect(() => {
    getUser();
  });

  // useEffect(() => {
  //   database()
  //     .ref(`users/${uid}/friends`)
  //     .on('value', snapshot => {
  //       if (snapshot.val()) {
  //         const users = Object.values(snapshot.val());
  //         const filterUser = users.filter(item => {
  //           const friend = item.accepted === true;
  //           const me = item.uid === myId;
  //           return friend && me;
  //         });
  //         if (filterUser) {
  //           setIsFriend(true);
  //         } else {
  //           setIsFriend(false);
  //         }
  //       }
  //     });
  // }, [isFriend, myId, uid]);

  return (
    <ScrollView contentContainerStyle={styles.scroll}>
      {/* Display the user's profile */}
      <View style={styles.viewContainer}>
        <View style={styles.mainInfo}>
          <Image
            source={
              user.photoURL
                ? {uri: user.photoURL}
                : require('../../assets/images/profile.png')
            }
            style={styles.pp}
          />
        </View>
        <View style={styles.mainContainer}>
          <View style={styles.formContainer}>
            {/* Display the user's username */}
            <View style={styles.singleForm}>
              <Text style={styles.subjectForm}>Username</Text>
              <TextInput
                style={styles.formInput}
                value={`     ${user.usernameId}`}
                editable={false}
                multiline={false}
              />
            </View>
            {/* Display the user's info */}
            <View style={styles.singleForm}>
              <Text style={styles.subjectForm}>Info</Text>
              <TextInput
                style={styles.wideInput}
                placeholder="You don't have any info yet"
                placeholderTextColor="grey"
                value={user.info}
                editable={false}
                multiline={true}
              />
            </View>
            {isFriend ? (
              <View style={{alignItems: 'center'}}>
                <Button
                  text="unfriend"
                  isLogout={true}
                  onPress={() => handleUnfriend()}
                />
              </View>
            ) : isPending ? (
              <View style={{alignItems: 'center'}}>
                <Button
                  text="Pending Request"
                  isPending={true}
                  disabled={true}
                />
              </View>
            ) : (
              <View style={{alignItems: 'center'}}>
                <Button text="add friend" onPress={() => handleAddFriend()} />
              </View>
            )}
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default UsersProfile;

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
    fontSize: 40,
    fontWeight: 'bold',
    flex: 1,
    marginTop: 50,
    marginBottom: 30,
    color: 'white',
    textAlign: 'center',
  },
  mainInfo: {
    flexDirection: 'row',
    margin: 30,
    alignItems: 'center',
  },
  pp: {
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 5,
    borderColor: 'white',
  },
  mainContainer: {
    width: '100%',
    backgroundColor: 'white',
    flex: 10,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
  },
  singleForm: {
    marginBottom: 20,
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
  formContainer: {
    margin: 20,
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
});
