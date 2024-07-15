/* eslint-disable react-hooks/exhaustive-deps */
import {StyleSheet, Text, View, FlatList} from 'react-native';
import React, {useEffect, useState} from 'react';
import auth from '@react-native-firebase/auth';
import database from '@react-native-firebase/database';
import {ChatBox} from '../components/ChatComponents';

const GroupScreen = ({navigation}) => {
  const [list, setList] = useState([]);
  const [chatList, setChatList] = useState([]);
  const [allGroup, setAllGroup] = useState([]);

  const getChatList = () => {
    const meUser = auth().currentUser;
    if (meUser) {
      database()
        .ref(`chatlist/${meUser.uid}`)
        .on('value', snapshot => {
          if (snapshot.val()) {
            const chatListArray = Object.values(snapshot.val());
            setList(chatListArray);
          }
        });
    }
  };

  useEffect(() => {
    getChatList();
  }, []);

  useEffect(() => {
    database()
      .ref('groups/')
      .on('value', snapshot => {
        if (snapshot.val()) {
          setAllGroup(Object.values(snapshot.val()));
        }
      });
  }, []);

  useEffect(() => {
    const newChatList = list
      .filter(item => item.isGroup)
      .map(item => {
        const group = allGroup.find(group => group.uid === item.uid);
        console.log(group);
        return {
          ...item,
          photoURL: group ? group?.photo || '' : '',
          name: group ? group?.name || '' : '',
        };
      });
    newChatList.sort((a, b) => b.time - a.time);
    setChatList(newChatList);
  }, [allGroup, list]);
  return (
    <View style={styles.mainContainer}>
      {/* Display list of chats */}
      <FlatList
        data={chatList}
        contentContainerStyle={styles.flatListContainer}
        keyExtractor={item => item.uid}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Text style={{alignSelf: 'center', color: 'grey', marginTop: 5}}>
            You haven't chat with anyone yet
          </Text>
        }
        renderItem={({item}) => (
          <ChatBox
            name={item.name}
            onPress={() => navigation.navigate('GroupChat', {item})}
            avatar={
              item.photoURL
                ? {uri: item.photoURL}
                : require('../../assets/images/group.png')
            }
          />
        )}
      />

      {/* Add button to navigate to search screen */}
    </View>
  );
};

export default GroupScreen;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    alignItems: 'left',
    justifyContent: 'flex-start',
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 16,
    right: 16,
  },
  userListButton: {
    backgroundColor: '#005418',
    padding: 16,
    borderRadius: 100,
  },
  headerContainer: {
    position: 'absolute',
    top: 0,
    right: 0,
    left: 0,
    height: 70,
    backgroundColor: '#005418',
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerText: {
    color: 'white',
    fontSize: 30,
    fontWeight: 'bold',
    margin: 10,
  },

  iconContainer: {
    backgroundColor: 'white',
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 15,
    margin: 10,
  },
  flatListContainer: {
    flexGrow: 1,
    paddingBottom: 10,
  },
});
