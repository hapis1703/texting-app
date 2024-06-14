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

const UsersProfile = ({route}) => {
  const uid = route.params.uid;
  const [user, setUser] = useState({});

  const getUser = async () => {
    await database()
      .ref(`users/${uid}`)
      .once('value')
      .then(snapshot => {
        setUser(snapshot.val());
      });
  };

  useEffect(() => {
    getUser();
  });
  return (
    <ScrollView contentContainerStyle={styles.scroll}>
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
            <View style={styles.singleForm}>
              <Text style={styles.subjectForm}>Username</Text>
              <TextInput
                style={styles.formInput}
                value={`     ${user.usernameId}`}
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
                value={user.info}
                editable={false}
                multiline={true}
              />
            </View>
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
