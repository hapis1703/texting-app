/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react/no-unstable-nested-components */
import React, {useEffect} from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {HomeScreen, FriendList} from '../screens';
import {TouchableOpacity, View, StyleSheet} from 'react-native';
import {Icon} from 'react-native-elements';
import {Text} from 'react-native';

const TabNavigator = ({navigation}) => {
  const Tab = createBottomTabNavigator();

  useEffect(() => {
    navigation.setOptions({
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
  }, [navigation]);

  return (
    <Tab.Navigator initialRouteName="Home">
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          headerShown: false,
          tabBarLabel: ({focused}) => (
            <Text
              style={{
                color: focused ? '#005418' : 'grey',
                fontSize: 12,
              }}>
              Home
            </Text>
          ),
          tabBarIcon: ({focused}) => (
            <Icon
              name="home"
              type="material-community"
              color={focused ? '#005418' : 'grey'}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Friends"
        component={FriendList}
        options={{
          headerShown: false,
          tabBarLabel: ({focused}) => (
            <Text
              style={{
                color: focused ? '#005418' : 'grey',
                fontSize: 12,
              }}>
              Friends
            </Text>
          ),
          tabBarIcon: ({focused}) => (
            <Icon
              name="people"
              type="Ionicons"
              color={focused ? '#005418' : 'grey'}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default TabNavigator;

const styles = StyleSheet.create({
  iconContainer: {
    backgroundColor: 'white',
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 15,
    margin: 10,
  },
});
