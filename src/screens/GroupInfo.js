import {
  StyleSheet,
  Text,
  View,
  Image,
  ScrollView,
  TextInput,
  FlatList,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import auth from '@react-native-firebase/auth';
import database from '@react-native-firebase/database';
import {Button, ChatBox} from '../components/ChatComponents';

const GroupInfo = ({route, navigation}) => {
  const groupId = route.params.uid;
  const myId = auth().currentUser.uid;
  const [members, setMembers] = useState([]);
  const [memberList, setMemberList] = useState([]);
  const [pendingMember, setPendingMember] = useState([]);
  const [group, setGroup] = useState({});
  const [allUser, setAllUser] = useState([]);

  const getGroup = () => {
    database()
      .ref(`groups/${groupId}`)
      .on('value', snapshot => {
        if (snapshot.val()) {
          setGroup(snapshot.val());
        }
      });
  };

  const getMembers = () => {
    database()
      .ref(`groups/${groupId}/members`)
      .on('value', snapshot => {
        if (snapshot.val()) {
          const members = Object.values(snapshot.val());
          setMemberList(members);
        }
      });
  };

  const getAllUser = () => {
    database()
      .ref(`users/`)
      .on('value', snapshot => {
        const users = Object.values(snapshot.val());
        setAllUser(users);
      });
  };

  const leaveGroup = () => {
    database().ref(`groups/${groupId}/members/${myId}`).remove();
    database().ref(`users/${myId}/groups/${groupId}`).remove();
    database().ref(`chatlist/${myId}/${groupId}`).remove();
    navigation.navigate('Tabs');
  };

  useEffect(() => {
    getGroup();
    getAllUser();
    getMembers();
  }, []);

  useEffect(() => {
    const newMemberList = memberList.map(item => {
      const user = allUser.find(user => user.uid === item.uid);
      return {
        ...item,
        photoURL: user ? user.photoURL || '' : '',
        username: user ? user.usernameId || '' : '',
      };
    });
    setMembers(newMemberList);
  }, [memberList, allUser]);

  return (
    <ScrollView contentContainerStyle={styles.scroll}>
      {/* Display the user's profile */}
      <View style={styles.viewContainer}>
        <View style={styles.mainInfo}>
          <Image
            source={
              group.photo
                ? {uri: group.photo}
                : require('../../assets/images/group.png')
            }
            style={styles.pp}
          />
        </View>
        <View style={styles.mainContainer}>
          <View style={styles.formContainer}>
            {/* Display the user's username */}
            <View style={styles.singleForm}>
              <Text style={styles.subjectForm}>Group name</Text>
              <TextInput
                style={styles.formInput}
                editable={false}
                multiline={false}
                value={`     ${group.name}`}
              />
            </View>
          </View>
          <View style={styles.memberList}>
            <Text style={styles.subjectForm}>Members</Text>
            {members.map(item => {
              return (
                <ChatBox
                  name={item.username}
                  avatar={{uri: item.photoURL}}
                  pending={!item.accepted}
                  disabled={true}
                />
              );
            })}
          </View>
          <View style={{alignItems: 'center'}}>
            <Button
              text="Leave Group"
              isLogout={true}
              onPress={() => leaveGroup()}
            />
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default GroupInfo;

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
