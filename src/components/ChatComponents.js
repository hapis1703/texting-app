/* eslint-disable react-native/no-inline-styles */
import {StyleSheet, Text, View, TouchableOpacity, Image} from 'react-native';
import React from 'react';

/**
 * ChatBox component.
 *
 * @param {Object} props - The properties for the component.
 * @param {Function} props.onPress - The function to be called when the chat box is pressed.
 * @param {String} props.name - The name of the user for whom the chat box is being rendered.
 * @param {Object} props.avatar - The source for the user's profile picture.
 * @param {Boolean} props.isHome - A flag indicating if the chat box is rendered in the home screen.
 * @param {String} props.message - The message to be displayed in the chat box if it is rendered in the home screen.
 * @returns {React.Component} A component representing a chat box.
 */
export const ChatBox = ({
  onPress,
  name,
  avatar,
  isHome,
  message,
  onLongPress,
}) => {
  // Render a chat box that displays the user's name and profile picture.
  return (
    // Wrap the chat box in a touchable opaque component to make it clickable.
    <TouchableOpacity onPress={onPress} onLongPress={onLongPress}>
      <View style={styles.chatBoxContainer}>
        {/* Render the user's profile picture. */}
        <Image source={avatar} style={styles.imagePP} />
        <View style={styles.JuduldanM}>
          {/* Render the user's name. */}
          <Text style={styles.userName}>{name}</Text>
          {/* Render the message if the chat box is rendered in the home screen. */}
          {isHome ? <Text style={styles.message}>{message}</Text> : null}
        </View>
      </View>
    </TouchableOpacity>
  );
};

/**
 * Button component.
 *
 * @param {Object} props - The properties for the component.
 * @param {String} props.text - The text to be displayed on the button.
 * @param {Boolean} props.isLogout - A flag indicating if the button is a logout button.
 * @returns {React.Component} A component representing a button.
 */
export const Button = props => {
  // Destructure the props to get the text and isLogout properties.
  const {text, isLogout, isPending} = props;

  // Render a button with the provided text and background color.
  return (
    <TouchableOpacity
      {...props}
      style={[
        styles.button, // Apply the styles for the button.
        {
          backgroundColor: isLogout
            ? '#F87B7B'
            : isPending
            ? '#f4f06a'
            : '#CAE3BB',
          opacity: isPending ? 0.5 : 1,
        }, // Set the background color based on the isLogout flag.
      ]}>
      <View>
        <View style={styles.textContainer}>
          {/* Render the container for the button text. */}
          <Text style={styles.text}>{text}</Text>
          {/* Render the button text. */}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  chatBoxContainer: {
    height: 67,
    width: '90%',
    borderWidth: 2,
    borderRadius: 20,
    marginLeft: 20,
    marginRight: 20,
    marginTop: 20,
    alignItems: 'center',
    flexDirection: 'row',
    padding: 15,
  },
  imagePP: {
    width: 48,
    height: 48,
    borderRadius: 100,
    marginRight: 20,
  },
  userName: {
    color: 'black',
    fontSize: 20,
    fontWeight: 'bold',
  },

  button: {
    flexDirection: 'row',
    width: '40%',
    alignItems: 'center',
    borderWidth: 2,
    borderRadius: 20,
    margin: 16,
    justifyContent: 'center',
  },
  text: {
    textTransform: 'uppercase',
    fontWeight: 'bold',
    color: 'black',
  },
  textContainer: {
    padding: 8,
    flexDirection: 'row',
  },
  message: {
    color: 'black',
  },
});
