import {StyleSheet, Text, TextInput, FlatList, View} from 'react-native';
import React, {useEffect, useState} from 'react';
import {ChatBox, Button} from '../components/ChatComponents';
import auth from '@react-native-firebase/auth';
import database from '@react-native-firebase/database';
import Toast from 'react-native-simple-toast';

const PendingGroups = ({navigation}) => {
  const myId = auth().currentUser.uid;
  const [allGroup, setAllGroup] = useState([]);
  const [pendList, setPendList] = useState([]);
  const [pendingGroup, setPendingGroup] = useState([]);
  const [pendingGroupB, setPendingGroupB] = useState([]);
  const [search, setSearch] = useState('');

  const getGroups = () => {
    database()
      .ref('groups/')
      .on('value', snapshot => {
        if (snapshot.val()) {
          const groups = Object.values(snapshot.val());
          setAllGroup(groups);
        }
      });
    database()
      .ref(`users/${myId}/groups`)
      .on('value', snapshot => {
        if (snapshot.val()) {
          const groups = Object.values(snapshot.val());
          const filterGroup = groups.filter(item => {
            return item.accepted === false;
          });
          console.log(filterGroup);
          setPendList(filterGroup);
        } else {
          setPendList([]);
        }
      });
  };

  const searchGroup = value => {
    const textData = value.toLowerCase();
    const searchedData = pendingGroupB.filter(item => {
      const itemData = item.name.toLowerCase();
      return itemData.indexOf(textData) > -1;
    });
    setSearch(value);
    setPendingGroup(searchedData);
  };

  const selectingGroup = (id, selected) => {
    const newSelected = pendingGroup.map(item => {
      if (item.uid === id) {
        item.selected = !selected;
      }
      return item;
    });
    setPendingGroup(newSelected);
    setPendingGroupB(newSelected);
  };

  const processSelectGroup = () => {
    const selectedGroup = pendingGroupB.filter(item => {
      return item.selected === true;
    });
    if (selectedGroup.length > 0) {
      const updates = {};
      selectedGroup.forEach(group => {
        updates[`groups/${group.uid}/members/${myId}`] = {
          accepted: true,
          uid: myId,
        };
        updates[`chatlist/${myId}/${group.uid}`] = {
          isGroup: true,
          uid: group.uid,
        };

        database().ref().update(updates);
      });
      navigation.navigate('Tabs');
    } else {
      Toast.show('Please select at least one group');
    }
  };

  const rejectInvite = () => {
    const selectedGroup = pendingGroupB.filter(item => {
      return item.selected === true;
    });
    if (selectedGroup.length > 0) {
      selectedGroup.forEach(group => {
        const groupId = group.uid;
        database().ref(`groups/${groupId}/members/${myId}`).remove();
        database().ref(`users/${myId}/groups/${groupId}`).remove();
      });
      navigation.navigate('Tabs');
    } else {
      Toast.show('Please select at least one group');
    }
  };

  useEffect(() => {
    const pendingGroup = pendList.map(item => {
      const groups = allGroup.find(group => group.uid === item.uid);
      return {
        photo: groups ? groups.photo || '' : '',
        name: groups ? groups.name || '' : '',
        uid: item.uid,
      };
    });
    setPendingGroup(pendingGroup);
    setPendingGroupB(pendingGroup);
    console.log(pendingGroup);
  }, [allGroup, pendList]);

  useEffect(() => {
    getGroups();
  }, []);

  return (
    <View style={styles.mainContainer}>
      <Text style={styles.searchText}>Search Groups</Text>
      <TextInput
        style={styles.usernameInput}
        onChangeText={text => searchGroup(text)}
        value={search}
      />
      <FlatList
        style={styles.list}
        data={pendingGroup}
        contentContainerStyle={styles.listb}
        keyExtractor={item => item.uid}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Text style={{alignSelf: 'center', color: 'grey', marginTop: 5}}>
            No Group Invites
          </Text>
        }
        renderItem={({item}) => {
          return (
            <ChatBox
              name={item.name}
              avatar={
                item.photo
                  ? item.selected
                    ? require('../../assets/images/check.png')
                    : {uri: item.photo}
                  : item.selected === true
                  ? require('../../assets/images/check.png')
                  : require('../../assets/images/group.png')
              }
              onPress={() => selectingGroup(item.uid, item.selected)}
            />
          );
        }}
      />
      <View style={styles.modalButton}>
        <Button text="decline" isLogout={true} onPress={() => rejectInvite()} />
        <Button text="accept" onPress={() => processSelectGroup()} />
      </View>
    </View>
  );
};

export default PendingGroups;

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
