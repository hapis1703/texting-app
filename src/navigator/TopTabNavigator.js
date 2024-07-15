/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react/no-unstable-nested-components */
import {Text} from 'react-native';
import React from 'react';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import {GroupScreen, HomeScreen} from '../screens';

const TopTabNavigator = () => {
  const Tab = createMaterialTopTabNavigator();
  return (
    <Tab.Navigator initialRouteName="Home">
      <Tab.Screen
        name="chat"
        component={HomeScreen}
        options={{
          tabBarLabel: ({focused}) => (
            <Text
              style={{
                color: focused ? 'black' : 'grey',
                fontWeight: 'bold',
              }}>
              Chats
            </Text>
          ),
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="groups"
        component={GroupScreen}
        options={{
          tabBarLabel: ({focused}) => (
            <Text
              style={{
                color: focused ? 'black' : 'grey',
                fontWeight: 'bold',
              }}>
              Groups
            </Text>
          ),
          headerShown: false,
        }}
      />
    </Tab.Navigator>
  );
};

export default TopTabNavigator;
