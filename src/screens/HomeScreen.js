/* eslint-disable no-shadow */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react/no-unstable-nested-components */
/* eslint-disable react-hooks/exhaustive-deps */
import {StyleSheet, Text, View, TouchableOpacity, FlatList} from 'react-native';
import React, {useEffect, useState} from 'react';
import {Icon} from 'react-native-elements';
import auth from '@react-native-firebase/auth';
import database from '@react-native-firebase/database';
import {ChatBox} from '../components/ChatComponents';
import {useDispatch} from 'react-redux';
import {userSignOut} from '../../store/reducer/user';

/**
 * HomeScreen component
 * @param {Object} navigation Navigation object containing functions like 'navigate'
 * @returns {React.Component} Displays list of users the current user has chatted with
 */
const HomeScreen = ({navigation}) => {
  // Store list of chats in state
  const [chatList, setChatList] = useState([]); // The list of chats
  const [list, setList] = useState([]); // The list of chat references
  const dispatch = useDispatch(); // The redux dispatch function
  const [allUser, setAllUser] = useState([]); // The list of all users

  /**
   * Get the list of chats from Firebase
   */
  const getChatList = () => {
    // Get current user's id
    const myId = auth().currentUser.uid;

    // Get list of chats from Firebase
    database()
      .ref(`chatlist/${myId}`)
      .on('value', snapshot => {
        // Check if there are any chats
        if (snapshot.val()) {
          // Update state with list of chats
          setList(Object.values(snapshot.val()));
        }
      });
  };

  // Update header and get chat list on mount
  useEffect(() => {
    // Set header title and back button on mount
    navigation.setOptions({
      headerLeft: () => <Text style={styles.headerText}>Messenger X</Text>,
      headerRight: () => (
        <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
          <View style={styles.iconContainer}>
            <Icon
              name="account"
              type="material-community"
              size={30}
              color="#005418"
              style={styles.iconHeader}
            />
          </View>
        </TouchableOpacity>
      ),
    });

    // Get list of chats from Firebase
    getChatList();
  }, []);

  // Listen for user authentication changes
  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged(user => {
      if (!user) {
        dispatch(userSignOut());
      }
    });
    return unsubscribe;
  }, [dispatch]);

  // Optimize homescreen
  useEffect(() => {
    const newChatList = list.map(item => {
      const user = allUser.find(user => user.uid === item.uid);
      return {
        ...item,
        photoURL: user ? user.photoURL || '' : '',
        usernameId: user ? user.usernameId || '' : '',
      };
    });
    newChatList.sort((a, b) => b.time - a.time);
    setChatList(newChatList);
  }, [list, allUser]);

  // Get list of all users
  useEffect(() => {
    database()
      .ref('users/')
      .on('value', snapshot => {
        setAllUser(Object.values(snapshot.val()));
      });
  }, []);

  // Render the list of chats and add button to navigate to search screen
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
            name={item.usernameId}
            onPress={() => navigation.navigate('Chat', {item})}
            avatar={
              item.photoURL
                ? {uri: item.photoURL}
                : require('../../assets/images/profile.png')
            }
            isHome={true}
            message={item.lastMsg}
            onLongPress={() =>
              navigation.navigate('UserProfile', {uid: item.uid})
            }
          />
        )}
      />

      {/* Add button to navigate to search screen */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.userListButton}
          onPress={() => navigation.navigate('SearchUser')}>
          <Icon name="search" type="font=awesome" size={24} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default HomeScreen;

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
    flex: 1,
  },
});
