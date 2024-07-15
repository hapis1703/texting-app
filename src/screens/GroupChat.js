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
const GroupChat = ({navigation, route}) => {
  // Get the other user and current user
  const group = route.params.item; // User object of the other user
  const meUser = auth().currentUser; // Current user object

  // Store messages in state
  const [messages, setMessages] = useState([]); // Array of messages

  // const getMessage = async () => {
  //   try {
  //     await database()
  //       .ref(`groups/${group.uid}/messages`)
  //       .on('value', snapshot => {
  //         if (snapshot.exists()) {
  //           const data = snapshot.val();
  //           const formatMessages = Object.values(data).map(item => {
  //             const forEachId = Object.values(data).forEach(item2 => {
  //               const user = database()
  //                 .ref(`users/${item2.userId}`)
  //                 .once('value');
  //               return user;
  //             });
  //             return {
  //               _id: item.id,
  //               text: item.text,
  //               createdAt: item.time,
  //               user: {
  //                 _id: item.userId,
  //               },
  //             };
  //           });
  //           const sortMessage = formatMessages.sort((a, b) => {
  //             return b.createdAt - a.createdAt;
  //           });
  //           setMessages(sortMessage);
  //         }
  //       });
  //   } catch (err) {
  //     console.error(err);
  //   }
  // };
  const getMessage = async () => {
    try {
      const messagesRef = database().ref(`groups/${group.uid}/messages`);
      messagesRef.on('value', async snapshot => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          const messagesArray = Object.values(data);

          // Fetch user details for each message
          const formatMessages = await Promise.all(
            messagesArray.map(async item => {
              const userSnapshot = await database()
                .ref(`users/${item.userId}`)
                .once('value');

              const user = userSnapshot.val();

              // Ensure user data exists
              if (user) {
                return {
                  _id: item.id,
                  text: item.text,
                  createdAt: item.time,
                  user: {
                    _id: item.userId,
                    name: user.usernameId || 'Unknown', // Default to 'Unknown' if usernameId doesn't exist
                    avatar: user.photoURL || null, // Default to null if photoURL doesn't exist
                  },
                };
              } else {
                // Handle case where user data is not found
                return {
                  _id: item.id,
                  text: item.text,
                  createdAt: item.time,
                  user: {
                    _id: item.userId,
                    name: 'Unknown', // Default to 'Unknown' if user data doesn't exist
                    avatar: null, // Default to null if user data doesn't exist
                  },
                };
              }
            }),
          );

          const sortMessage = formatMessages.sort((a, b) => {
            return b.createdAt - a.createdAt;
          });

          setMessages(sortMessage);
        }
      });
    } catch (err) {
      console.error(err);
    }
  };

  const sendMessage = useCallback((messages = []) => {
    const newRef = database().ref(`groups/${group.uid}/messages`).push();
    newRef.set({
      id: newRef.key,
      text: messages[0].text,
      time: new Date().getTime(),
      userId: meUser.uid,
    });
  }, []);

  useEffect(() => {
    getMessage();
  }, []);

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
            onPress={() => navigation.navigate('GroupInfo', {uid: group.uid})}>
            <Image
              source={
                group.photoURL
                  ? {uri: group.photoURL}
                  : require('../../assets/images/group.png')
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
      headerTitle: group.name,
    });
  }, []);

  // Get messages from Firebase
  /**
   * Get messages from Firebase and update state
   */

  // Get messages from Firebase on mount

  // Send message to Firebase
  /**
   * Send message to Firebase
   * @param {Array} messages Array of messages to send
   */

  return (
    <View style={styles.mainContainer}>
      {/* GiftedChat component */}
      <GiftedChat
        messages={messages} // Array of messages// Function to send messages
        onSend={messages => sendMessage(messages)}
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
        user={{_id: meUser.uid, name: meUser.displayName}} // User object of the current user // Function to render avatar
        alwaysShowSend={true} // Always show send button
        renderUsernameOnMessage={true}
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

export default GroupChat;

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
