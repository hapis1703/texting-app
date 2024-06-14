/* eslint-disable react-native/no-inline-styles */
/* eslint-disable no-shadow */
/* eslint-disable react/no-unstable-nested-components */
/* eslint-disable react-hooks/exhaustive-deps */
import {StyleSheet, View, TouchableOpacity, Image} from 'react-native';
import React, {useCallback, useEffect, useState} from 'react';
import {Icon} from 'react-native-elements';
import {Bubble, Composer, GiftedChat, Send} from 'react-native-gifted-chat';
import auth from '@react-native-firebase/auth';
import database from '@react-native-firebase/database';

/**
 * ChatScreen component
 * @param {Object} navigation Navigation object containing functions like 'navigate'
 * @param {Object} route Route object containing params passed to the screen
 * @returns {React.Component} Chat screen with messages
 */
const ChatScreen = ({navigation, route}) => {
  // Get the other user and current user
  const notMeUser = route.params.item; // User object of the other user
  const meUser = auth().currentUser; // Current user object

  // Store messages in state
  const [messages, setMessages] = useState([]); // Array of messages

  // Set header title and back button on mount
  useEffect(() => {
    navigation.setOptions({
      /**
       * Component for the header left button
       * @returns {React.Component} Back button
       */
      headerLeft: () => (
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
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
          <TouchableOpacity
            onPress={() =>
              navigation.navigate('UserProfile', {uid: notMeUser.uid})
            }>
            <Image
              source={
                notMeUser.photoURL
                  ? {uri: notMeUser.photoURL}
                  : require('../../assets/images/profile.png')
              }
              width={50}
              height={50}
              style={styles.pp}
            />
          </TouchableOpacity>
        </View>
      ),
      /**
       * Title of the header
       */
      headerTitle: notMeUser.usernameId,
    });
  }, []);

  // Get messages from Firebase
  /**
   * Get messages from Firebase and update state
   */
  const getMessage = () => {
    // Get messages from Firebase
    database()
      .ref(`messages/${meUser.uid}/${notMeUser.uid}`)
      .orderByChild('createdAt')
      .on('value', snapshot => {
        if (snapshot.val() !== null) {
          // Sort messages by createdAt
          setMessages(
            Object.values(snapshot.val()).sort((a, b) => {
              return b.createdAt - a.createdAt;
            }),
          );
        }
      });
  };

  // Get messages from Firebase on mount
  useEffect(() => {
    getMessage();
  }, []);

  // Send message to Firebase
  /**
   * Send message to Firebase
   * @param {Array} messages Array of messages to send
   */
  const sendMessage = useCallback((messages = []) => {
    // Push new message to Firebase

    // Set message data in Firebase
    const newRef1 = database()
      .ref(`messages/${meUser.uid}/${notMeUser.uid}`)
      .push();
    const newRef2 = database()
      .ref(`messages/${notMeUser.uid}/${meUser.uid}`)
      .push();
    newRef1.set({
      _id: newRef1.key,
      text: messages[0].text,
      createdAt: new Date().getTime(),
      user: {
        _id: meUser.uid,
      },
    });
    newRef2.set({
      _id: newRef2.key,
      text: messages[0].text,
      createdAt: new Date().getTime(),
      user: {
        _id: meUser.uid,
      },
    });

    // Update chatlist in Firebase
    database().ref(`chatlist/${notMeUser.uid}/${meUser.uid}`).update({
      uid: meUser.uid,
      lastMsg: messages[0].text,
      time: new Date().getTime(),
    });
    database().ref(`chatlist/${meUser.uid}/${notMeUser.uid}`).update({
      uid: notMeUser.uid,
      lastMsg: messages[0].text,
      time: new Date().getTime(),
    });
  }, []);

  return (
    <View style={styles.mainContainer}>
      {/* GiftedChat component */}
      <GiftedChat
        messages={messages} // Array of messages
        onSend={messages => sendMessage(messages)} // Function to send messages
        renderComposer={props => (
          <Composer
            {...props}
            textInputStyle={{color: 'black'}}
            placeholderTextColor="grey"
            textInputProps={{
              backgroundColor: '#d2d1d2',
              borderRadius: 10,
              marginTop: 5,
              marginBottom: 5,
              marginRight: 5,
              marginLeft: 5,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          />
        )}
        user={{_id: meUser.uid, name: meUser.displayName}} // User object of the current user
        showAvatarForEveryMessage={false}
        renderAvatar={null} // Function to render avatar
        alwaysShowSend={true} // Always show send button
        renderSend={props => {
          return (
            <Send
              {...props}
              containerStyle={{
                padding: 0,
                marginBottom: 5,
                marginTop: -10,
              }}>
              <View
                style={{
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 10,
                  marginBottom: 5,
                }}>
                <Icon
                  name="send"
                  type="Ionicons"
                  size={30}
                  style={{alignSelf: 'center'}}
                  color="#005418"
                />
              </View>
            </Send>
          );
        }}
        renderBubble={props => {
          return (
            <Bubble
              {...props}
              wrapperStyle={{right: {backgroundColor: 'green'}}}
            />
          );
        }}
        isCustomViewBottom={true}
      />
    </View>
  );
};

export default ChatScreen;

const styles = StyleSheet.create({
  mainContainer: {
    backgroundColor: 'white',
    flex: 1,
  },
  iconContainer: {
    backgroundColor: 'white',
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 15,
    margin: 10,
  },
  pp: {
    borderRadius: 100,
    borderWidth: 2,
    borderColor: 'white',
    width: 50,
    height: 50,
  },
  iconAction: {
    alignSelf: 'center',
  },
  actionButton: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
});
