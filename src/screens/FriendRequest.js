/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable eqeqeq */
import {StyleSheet, Text, View, TextInput, FlatList} from 'react-native';
import React, {useEffect, useState} from 'react';
import {ChatBox, Button} from '../components/ChatComponents';
import database from '@react-native-firebase/database';
import auth from '@react-native-firebase/auth';
import Toast from 'react-native-simple-toast';

const FriendRequest = ({navigation}) => {
  const myId = auth().currentUser.uid;
  const [reqUser, setReqUser] = useState([]);
  const [reqUserB, setReqUserB] = useState([]);
  const [reqList, setReqList] = useState([]);
  const [allUser, setAllUser] = useState([]);
  const [search, setSearch] = useState('');

  const getReqUser = () => {
    database()
      .ref('users/')
      .on('value', snapshot => {
        const users = Object.values(snapshot.val());
        const filterUser = users.filter(item => item.uid != myId);
        setAllUser(filterUser);
      });
    database()
      .ref(`users/${myId}/friends`)
      .on('value', snapshot => {
        if (snapshot.val()) {
          const users = Object.values(snapshot.val());
          const filterUser = users.filter(item => {
            return item.ingoing === true && item.outgoing === false;
          });
          setReqList(filterUser);
        } else {
          setReqList([]);
        }
      });
  };

  const selectingUser = (id, selected) => {
    const newSelected = reqUser.map(item => {
      if (item.uid === id) {
        item.selected = !selected;
      }
      return item;
    });
    setReqUser(newSelected);
    setReqUserB(newSelected);
  };

  const searchUser = value => {
    const textData = value.toLowerCase();
    const searchedData = reqUserB.filter(item => {
      const itemData = item.usernameId.toLowerCase();
      return itemData.indexOf(textData) > -1;
    });
    setSearch(value);
    setReqUser(searchedData);
  };

  const processSelectUser = () => {
    const selectedUsers = reqUserB.filter(item => {
      return item.selected === true;
    });
    if (selectedUsers) {
      selectedUsers.forEach(user => {
        const userId = user.uid;
        database().ref(`users/${userId}/friends/${myId}`).update({
          outgoing: null,
          ingoing: null,
          accepted: true,
          uid: myId,
        });
        database().ref(`users/${myId}/friends/${userId}`).update({
          outgoing: null,
          ingoing: null,
          accepted: true,
          uid: userId,
        });
      });
      navigation.navigate('Tabs');
    } else {
      Toast.show('Please select at least one users');
    }
  };

  const rejectedUser = () => {
    const selectedUsers = reqUserB.filter(item => {
      return item.selected === true;
    });
    if (selectedUsers) {
      selectedUsers.forEach(user => {
        const userId = user.uid;
        database().ref(`users/${userId}/friends/${myId}`).remove();
        database().ref(`users/${myId}/friends/${userId}`).remove();
      });
      navigation.navigate('Tabs');
    } else {
      Toast.show('Please select at least one users');
    }
  };

  useEffect(() => {
    getReqUser();
  }, []);

  useEffect(() => {
    const requestUser = reqList.map(item => {
      const users = allUser.find(user => user.uid === item.uid);
      return {
        photoURL: users ? users.photoURL || '' : '',
        usernameId: users ? users.usernameId || '' : '',
        uid: item.uid,
      };
    });
    setReqUser(requestUser);
    setReqUserB(requestUser);
    console.log(reqUser);
  }, [reqList, allUser]);

  return (
    <View style={styles.mainContainer}>
      <Text style={styles.searchText}>Search Users</Text>
      <TextInput
        style={styles.usernameInput}
        value={search}
        onChangeText={p => searchUser(p)}
      />
      <FlatList
        style={styles.list}
        contentContainerStyle={styles.listb}
        data={reqUser}
        keyExtractor={item => item.uid}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Text style={{alignSelf: 'center', color: 'grey', marginTop: 5}}>
            No Friend Request
          </Text>
        }
        renderItem={({item}) => {
          return (
            <ChatBox
              name={item.usernameId}
              avatar={
                item.photoURL
                  ? item.selected
                    ? require('../../assets/images/check.png')
                    : {uri: item.photoURL}
                  : item.selected === true
                  ? require('../../assets/images/check.png')
                  : require('../../assets/images/profile.png')
              }
              onPress={() => selectingUser(item.uid, item.selected)}
            />
          );
        }}
      />
      <View style={styles.modalButton}>
        <Button text="decline" isLogout={true} onPress={() => rejectedUser()} />
        <Button text="accept" onPress={() => processSelectUser()} />
      </View>
    </View>
  );
};

export default FriendRequest;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  usernameInput: {
    padding: 8,
    flex: 1,
    color: 'black',
    borderWidth: 3,
    margin: 8,
    position: 'absolute',
    width: '90%',
    alignSelf: 'center',
    borderRadius: 10,
    top: 20,
  },
  searchText: {
    fontSize: 20,
    color: 'black',
    alignSelf: 'center',
    fontWeight: 'bold',
  },
  list: {
    flexGrow: 1,
    marginTop: 60,
    marginBottom: 80,
  },
  modalButton: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    position: 'absolute',
    bottom: 10,
    width: '100%',
  },
});
