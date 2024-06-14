import {StyleSheet, View, TextInput, FlatList} from 'react-native';
import React, {useEffect, useState} from 'react';
import {Icon} from 'react-native-elements';
import database from '@react-native-firebase/database';
import auth from '@react-native-firebase/auth';
import {ChatBox} from '../components/ChatComponents';

/**
 * AllUserScreen component
 * Displays all users from Firebase in a list
 * @param {Object} navigation Navigation object containing functions like 'navigate'
 * @returns {React.Component} Component that displays all users
 */
const AllUserScreen = ({navigation}) => {
  // Store the searchText, allUser, and allUserBackup in state
  const [searchText, setSearchText] = useState(''); // The searchText
  const [allUser, setAllUser] = useState([]); // The list of all users from Firebase
  const [allUserBackup, setAllUserBackup] = useState([]); // The backup of allUser

  /**
   * Get all users from Firebase
   */
  const getAllUser = () => {
    // Get current user's id
    const myUser = auth().currentUser;
    // Get all users from Firebase
    database()
      .ref('/users')
      .on('value', snapshot => {
        // Filter out current user and set allUser and allUserBackup
        const users = Object.values(snapshot.val());
        const filteredUsers = users.filter(item => item.uid !== myUser.uid);

        setAllUser(filteredUsers);
        setAllUserBackup(filteredUsers);
      });
  };

  /**
   * Search for users based on searchText
   * @param {String} value The searchText
   */
  const searchData = value => {
    // Get the searchText in lowercase
    const textData = value.toLowerCase();
    // Filter the allUserBackup based on searchText
    const searchedData = allUserBackup.filter(item => {
      // Get the item.usernameId in lowercase
      const itemData = item.usernameId.toLowerCase();
      // Check if the searchText is in the item.usernameId
      return itemData.indexOf(textData) > -1;
    });
    // Set the searchText and allUser
    setSearchText(value);
    setAllUser(searchedData);
  };

  // Get all users from Firebase on mount
  useEffect(() => {
    // Call getAllUser when the component mounts
    getAllUser();
  }, []);

  return (
    // The main container
    <View style={styles.mainContainer}>
      {/* The list of users */}
      <FlatList
        data={allUser} // The data to display in the list
        keyExtractor={item => item.uid} // The key for each item
        showsVerticalScrollIndicator={false} // Hide the scroll indicator
        ListHeaderComponent={
          // Render the search box as a ListHeaderComponent
          <View style={styles.searchBox}>
            {/* The search icon */}
            <Icon
              name="search"
              type="font-awesome"
              size={18}
              style={styles.searchIcon}
              color="black"
            />
            {/* The search input */}
            <TextInput
              placeholder="Search User" // The placeholder text
              style={styles.searchInput}
              onChangeText={text => searchData(text)} // The function to call when the text changes
              value={searchText} // The current value
              placeholderTextColor="black" // The color of the placeholder text
            />
          </View>
        }
        renderItem={({item}) => {
          // Render a ChatBox for each item in the list
          return (
            <ChatBox
              name={item.usernameId} // The name of the user
              onPress={() => navigation.navigate('Chat', {item})} // The function to call when the user is pressed
              avatar={
                item.photoURL
                  ? {uri: item.photoURL}
                  : require('../../assets/images/profile.png')
              }
              onLongPress={() =>
                navigation.navigate('UserProfile', {uid: item.uid})
              }
            />
          );
        }}
      />
    </View>
  );
};

export default AllUserScreen;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  searchBox: {
    flexDirection: 'row',
    borderWidth: 1,
    margin: 8,
    borderRadius: 10,
    alignItems: 'center',
  },
  searchIcon: {
    padding: 8,
    paddingRight: 0,
  },
  searchInput: {
    height: 50,
    padding: 8,
    flex: 1,
    color: 'black',
  },
});
