import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Modal,
  TextInput,
  FlatList,
  Image,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {Icon} from 'react-native-elements';
import {Button, ChatBox} from '../components/ChatComponents';
import database from '@react-native-firebase/database';
import auth from '@react-native-firebase/auth';
import Toast from 'react-native-simple-toast';

const FriendList = ({navigation}) => {
  const myId = auth().currentUser.uid;
  const [addUser, setAddUser] = useState([]); // The list of all users from Firebase
  const [addUserBackup, setAddUserBackup] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [isAddFriendVis, setIsAddFriendVis] = useState(false);
  const [friendlist, setFriendlist] = useState([]);
  const [allUser, setAllUser] = useState([]);
  const [friends, setFriends] = useState([]);

  const getAddUser = () => {
    // Get current user's id
    const myUser = auth().currentUser;
    // Get all users from Firebase
    database()
      .ref('/users')
      .on('value', snapshot => {
        // Filter out current user and set allUser and allUserBackup
        const users = Object.values(snapshot.val());
        const anotherUsers = users.filter(item => item.uid !== myUser.uid);
        const filterUser = anotherUsers.filter(item => {
          const friend = item.friends;
          if (friend) {
            return !Object.keys(friend).includes(myId);
          } else {
            return !friend;
          }
        });

        setAddUser(filterUser);
        setAddUserBackup(filterUser);
      });
  };

  const selectedItems = (id, selected) => {
    const newSelected = addUser.map(item => {
      if (item.uid === id) {
        item.selected = !selected;
      }
      return item;
    });
    setAddUser(newSelected);
    setAddUserBackup(newSelected);
  };

  const searchData = value => {
    const textData = value.toLowerCase();
    const searchedData = addUserBackup.filter(item => {
      const itemData = item.usernameId.toLowerCase();
      return itemData.indexOf(textData) > -1;
    });
    setSearchText(value);
    setAddUser(searchedData);
  };

  const addButtonPressed = () => {
    setIsAddFriendVis(!isAddFriendVis);
    getAddUser();
  };

  const processSelectUser = () => {
    const selectedUsers = addUserBackup.filter(item => item.selected === true);
    console.log(selectedUsers);
    if (selectedUsers) {
      selectedUsers.forEach(user => {
        const userId = user.uid;
        database().ref(`users/${userId}/friends/${myId}`).update({
          accepted: false,
          ingoing: true,
          outgoing: false,
          uid: myId,
        });
        database().ref(`users/${myId}/friends/${userId}`).update({
          accepted: false,
          ingoing: false,
          outgoing: true,
          uid: userId,
        });
      });
      setIsAddFriendVis(false);
    } else {
      Toast.show('Please select at least one users');
    }
  };

  const getFriends = () => {
    const myUser = auth().currentUser;
    database()
      .ref('users/')
      .on('value', snapshot => {
        const users = Object.values(snapshot.val());
        const filterUser = users.filter(item => item.uid !== myUser.uid);
        setAllUser(filterUser);
      });
    database()
      .ref(`/users/${myUser.uid}/friends`)
      .on('value', snapshot => {
        if (snapshot.val()) {
          const users = Object.values(snapshot.val());
          const filterUser = users.filter(item => {
            return item.accepted === true;
          });
          setFriendlist(filterUser);
        }
      });
  };

  useEffect(() => {
    getFriends();
  }, []);

  useEffect(() => {
    const newFriendList = friendlist.map(item => {
      const users = allUser.find(user => user.uid === item.uid);
      return {
        uid: item.uid,
        photoURL: users ? users.photoURL || '' : '',
        usernameId: users ? users.usernameId || '' : '',
      };
    });
    setFriends(newFriendList);
  }, [friendlist, allUser]);

  return (
    <ScrollView style={styles.scroll}>
      <View style={styles.mainContainer}>
        <View style={styles.groupContainer}>
          <View style={styles.groupHeader}>
            <Text style={styles.groupTitle}>Groups</Text>
          </View>
          <TouchableOpacity
            style={styles.groupMain}
            onPress={() => navigation.navigate('CreateGroup')}>
            <View style={styles.groupIcons}>
              <View style={styles.groupIcon}>
                <Icon name="group" type="FontAwesome" size={30} color="black" />
              </View>
            </View>
            <Text style={styles.groupText}>Create New Group</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.groupMain}>
            <View style={styles.groupIcons}>
              <View style={styles.groupIcon}>
                <Icon
                  name="pending"
                  type="materialicons"
                  size={30}
                  color="black"
                />
              </View>
            </View>
            <Text style={styles.groupText}>Pending Invites</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.groupContainer}>
          <View style={styles.groupHeader}>
            <Text style={styles.groupTitle}>Friends</Text>
          </View>
          <TouchableOpacity
            style={styles.groupMain}
            onPress={() => addButtonPressed()}>
            <View style={styles.groupIcons}>
              <View style={[styles.groupIcon, styles.addIcon]}>
                <Icon name="add" type="Ionicons" size={30} color="black" />
              </View>
            </View>
            <Text style={styles.groupText}>Add Friend</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.groupMain}
            onPress={() => navigation.navigate('FriendReq')}>
            <View style={styles.groupIcons}>
              <View style={[styles.groupIcon, styles.addIcon]}>
                <Icon
                  name="pending"
                  type="materialicons"
                  size={30}
                  color="black"
                />
              </View>
            </View>
            <Text style={styles.groupText}>Friend Requests</Text>
          </TouchableOpacity>
          <FlatList
            data={friends}
            keyExtractor={item => item.uid}
            showsVerticalScrollIndicator={false}
            renderItem={({item}) => {
              return (
                <TouchableOpacity
                  style={styles.groupMain}
                  onPress={() => navigation.navigate('Chat', {item})}
                  onLongPress={() =>
                    navigation.navigate('UserProfile', {uid: item.uid})
                  }>
                  <Image
                    source={
                      item.photoURL
                        ? {uri: item.photoURL}
                        : require('../../assets/images/profile.png')
                    }
                    style={styles.pp}
                  />
                  <Text style={styles.groupText}>{item.usernameId}</Text>
                </TouchableOpacity>
              );
            }}
          />
        </View>
        <Modal
          animationType="slide"
          transparent={true}
          visible={isAddFriendVis}
          onRequestClose={() => setIsAddFriendVis(false)}>
          <View style={styles.backgroundView}>
            <View style={styles.modalView}>
              <Text style={styles.modalText}>Search Users</Text>
              <TextInput
                style={styles.usernameInput}
                value={searchText}
                onChangeText={text => searchData(text)}
              />
              <FlatList
                style={styles.list}
                contentContainerStyle={styles.listb}
                data={addUser}
                keyExtractor={item => item.uid}
                showsVerticalScrollIndicator={false}
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
                      onPress={() => selectedItems(item.uid, item.selected)}
                    />
                  );
                }}
              />
              <View style={styles.modalButton}>
                <Button
                  text="cancel"
                  isLogout={true}
                  onPress={() => setIsAddFriendVis(false)}
                />
                <Button text="Confirm" onPress={() => processSelectUser()} />
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </ScrollView>
  );
};

export default FriendList;

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 1,
  },
  mainContainer: {
    flex: 1,
  },
  groupContainer: {
    width: '100%',
    flex: 1,
  },
  groupHeader: {
    backgroundColor: '#b4b3b4',
    height: 30,
    justifyContent: 'center',
    padding: 5,
  },
  groupTitle: {
    fontWeight: 'bold',
    color: 'black',
  },
  groupMain: {
    alignItems: 'center',
    width: '100%',
    marginTop: 5,
    padding: 7,
    flexDirection: 'row',
  },
  groupIcon: {
    backgroundColor: 'green',
    position: 'static',
    borderRadius: 100,
    padding: 5,
    borderWidth: 3,
  },
  groupIcons: {
    width: 48,
  },
  groupText: {
    color: 'black',
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  addIcon: {
    backgroundColor: '#f7d639',
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
  list: {
    height: '50%',
    marginTop: 5,
    width: '100%',
  },
  listb: {
    justifyContent: 'center',
  },
  pp: {
    width: 48,
    height: 48,
    borderRadius: 100,
    borderWidth: 2,
    borderColor: 'black',
  },
});
