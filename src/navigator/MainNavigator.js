/* eslint-disable react/no-unstable-nested-components */
import React from 'react';
import {StyleSheet, Text} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';

import {useSelector} from 'react-redux';
import TabNavigator from './TabNavigator';
import {
  AllUserScreen,
  ChatScreen,
  ProfileScreen,
  UsersProfile,
  LoginScreen,
  RegisterScreen,
  ForgotPassword,
  FriendRequest,
  CreateGroup,
} from '../screens';

/**
 * Main navigator component
 * @returns {React.Component} React component for the main navigator
 */
const MainNavigator = ({navigation}) => {
  // Create a stack navigator
  const Stack = createStackNavigator();
  // Get the user's login status from the store
  const isLogin = useSelector(state => state.user.isLogin);

  /**
   * Main stack navigator component
   * @returns {React.Component} React component for the main stack navigator
   */
  return (
    <NavigationContainer>
      {/* Render the login or home stack navigator based on the user's login status */}
      {isLogin ? (
        <Stack.Navigator initialRouteName="Home">
          {/* Home screen stack */}
          <Stack.Screen
            name="Tabs"
            component={TabNavigator}
            options={{
              // Header style for the home screen
              headerStyle: {backgroundColor: '#005418', height: 70},
              // Hide the header title
              headerTitle: '',
              headerLeft: () => (
                <Text style={styles.headerText}>Messenger X</Text>
              ),
            }}
          />
          {/* Search user screen stack */}
          <Stack.Screen
            name="SearchUser"
            component={AllUserScreen}
            options={{headerShown: false}}
          />
          {/* Chat screen stack */}
          <Stack.Screen
            name="Chat"
            component={ChatScreen}
            options={{
              // Header style for the chat screen
              headerStyle: {backgroundColor: '#005418', height: 70},
              // Header title style for the chat screen
              headerTitleStyle: {
                color: 'white',
                fontSize: 30,
                fontWeight: 'bold',
              },
            }}
          />
          <Stack.Screen
            name="Profile"
            component={ProfileScreen}
            options={{
              headerStyle: {backgroundColor: '#005418', height: 70},
              headerTitleStyle: {
                color: 'white',
                fontSize: 30,
                fontWeight: 'bold',
              },
              // Header title for the profile screen
              headerTitle: 'Profile',
            }}
          />
          <Stack.Screen
            name="UserProfile"
            component={UsersProfile}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="FriendReq"
            component={FriendRequest}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="CreateGroup"
            component={CreateGroup}
            options={{title: 'Create New Group'}}
          />
        </Stack.Navigator>
      ) : (
        <Stack.Navigator initialRouteName="Login">
          {/* Login screen stack */}
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{headerShown: false}}
          />
          {/* Register screen stack */}
          <Stack.Screen
            name="Register"
            component={RegisterScreen}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="ForgotP"
            component={ForgotPassword}
            options={{headerShown: false}}
          />
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
};

export default MainNavigator;

const styles = StyleSheet.create({
  headerText: {
    color: 'white',
    fontSize: 30,
    fontWeight: 'bold',
    margin: 10,
  },
});
