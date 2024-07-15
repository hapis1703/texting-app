/* eslint-disable react/no-unstable-nested-components */
import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import {Image} from 'react-native-elements';
import database from '@react-native-firebase/database';
import auth from '@react-native-firebase/auth';
import {Button, ChatBox} from '../components/ChatComponents';
import uuid from 'react-native-uuid';
import Toast from 'react-native-simple-toast';
import ImagePicker from 'react-native-image-crop-picker';
import storage from '@react-native-firebase/storage';
import {Icon} from 'react-native-elements';

const CreateGroup = ({navigation}) => {
  const myId = auth().currentUser.uid;
  const [name, setName] = useState('');
  const [friendList, setFriendList] = useState([]);
  const [photo, setPhoto] = useState({});
  const [photoLink, setPhotoLink] = useState('');
  const [disabled, setDisabled] = useState(false);

  const selectedUser = (id, selected) => {
    const newSelected = friendList.map(item => {
      if (item.uid === id) {
        item.selected = !selected;
      }
      return item;
    });
    setFriendList(newSelected);
    console.log(newSelected);
  };

  const uploadPhoto = async () => {
    try {
      const image = await ImagePicker.openPicker({
        width: 400,
        height: 400,
        cropping: true,
      });
      setPhoto(image);
    } catch (error) {
      console.error(error);
    }
  };

  const uploadPhotoToStorage = async (photo, groupId) => {
    const imgName = photo.path.substring(photo.path.lastIndexOf('/') + 1);
    const ext = imgName.split('.').pop();
    const name = imgName.split('.')[0];
    const newName = `${name}${groupId}.${ext}`;
    const ref = storage().ref(`groups/${groupId}/${newName}`);

    await ref.putFile(photo.path);
    const url = await ref.getDownloadURL();
    return url;
  };

  const creatingGroup = async () => {
    const groupId = uuid.v4();
    const selectedUsers = friendList.filter(item => item.selected === true);

    if (selectedUsers.length <= 0) {
      Toast.show('Please select at least one user');
      return;
    }

    if (name === '') {
      Toast.show('Please enter group name');
      return;
    }

    try {
      Toast.show('Please wait until the process is done', 2000);
      let photoURL = '';
      if (photo.path) {
        photoURL = await uploadPhotoToStorage(photo, groupId);
      }

      await database().ref(`groups/${groupId}`).set({
        name: name,
        uid: groupId,
        photo: photoURL,
      });

      const updates = {};
      selectedUsers.forEach(user => {
        const userId = user.uid;
        updates[`groups/${groupId}/members/${userId}`] = {
          uid: userId,
          accepted: false,
        };
        updates[`users/${userId}/groups/${groupId}`] = {
          uid: groupId,
          accepted: false,
        };
      });

      updates[`groups/${groupId}/members/${myId}`] = {
        uid: myId,
        accepted: true,
      };
      updates[`users/${myId}/groups/${groupId}`] = {
        uid: groupId,
        accepted: true,
      };
      updates[`chatlist/${myId}/${groupId}`] = {
        isGroup: true,
        time: new Date().getTime(),
        uid: groupId,
      };

      await database().ref().update(updates);

      Toast.show('Group created successfully');
      navigation.navigate('Friends');
    } catch (error) {
      console.error(error);
      Toast.show('Error creating group. Please try again.');
    }
  };

  const exitScreen = () => {
    ImagePicker.clean()
      .then(() => {
        console.log('Removed all tmp images from tmp directory');
      })
      .catch(e => {
        console.error(e);
      });

    navigation.navigate('Friends');
  };

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const friendSnapshot = await database()
          .ref(`users/${myId}/friends`)
          .once('value');
        if (friendSnapshot.val()) {
          const friends = Object.values(friendSnapshot.val());
          const acceptedFriends = friends.filter(
            item => item.accepted === true,
          );

          const friendDataPromises = acceptedFriends.map(async friend => {
            const userSnapshot = await database()
              .ref(`users/${friend.uid}`)
              .once('value');
            const userData = userSnapshot.val();
            return {
              usernameId: userData.usernameId || '',
              photoURL: userData.photoURL || '',
              uid: friend.uid,
              selected: false,
            };
          });

          const friendData = await Promise.all(friendDataPromises);
          setFriendList(friendData);
          console.log(friendData);
        } else {
          setFriendList([]);
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchFriends();
  }, [myId]);

  const buttonPress = () => {
    setDisabled(true);
    creatingGroup();
  };

  useEffect(() => {
    // Set the header of the screen
    navigation.setOptions({
      headerLeft: () => (
        <TouchableOpacity onPress={() => exitScreen()}>
          <View style={styles.iconContainer}>
            <Icon
              name="arrowleft"
              type="antdesign"
              size={20}
              color="white"
              style={styles.iconHeader}
            />
          </View>
        </TouchableOpacity>
      ),
    });
  });
  // Include myId in the dependency array if it might change
  return (
    <View style={styles.mainContainer}>
      <View style={styles.header}>
        <View style={styles.imageContainer}>
          <View style={styles.imageView}>
            <Image
              source={
                photo && photo.path
                  ? {uri: photo.path}
                  : require('../../assets/images/group.png')
              }
              style={styles.image}
            />
          </View>
          <TouchableOpacity
            style={styles.editPButton}
            onPress={() => uploadPhoto()}>
            <Text style={styles.editPhoto}>Edit Photo</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.nameContainer}>
          <Text style={styles.name}>Set Group Name</Text>
          <TextInput
            placeholder="Group name"
            style={styles.inputName}
            placeholderTextColor="grey"
            value={name}
            onChangeText={text => setName(text)}
          />
        </View>
      </View>
      <View style={styles.mainContent}>
        <Text style={styles.searchTitle}>Invite Friends</Text>
        <FlatList
          data={friendList}
          keyExtractor={item => item.uid}
          renderItem={({item}) => {
            return (
              <ChatBox
                name={item.usernameId}
                avatar={
                  item.photoURL
                    ? item.selected
                      ? require('../../assets/images/check.png')
                      : {uri: item.photoURL}
                    : item.selected
                    ? require('../../assets/images/check.png')
                    : require('../../assets/images/profile.png')
                }
                onPress={() => selectedUser(item.uid, item.selected)}
              />
            );
          }}
        />
        <View style={styles.forButton}>
          <Button
            text="create group"
            onPress={() => buttonPress()}
            disabled={disabled}
          />
        </View>
      </View>
    </View>
  );
};

export default CreateGroup;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    width: '100%',
    flex: 1,
  },
  imageContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  image: {
    width: 107,
    height: 107,
    borderRadius: 100,
  },
  imageView: {
    backgroundColor: 'white',
    borderRadius: 100,
    padding: 0,
    borderWidth: 2,
    marginBottom: 3,
  },
  nameContainer: {
    flex: 2,
    justifyContent: 'center',
    marginRight: 20,
  },
  editPhoto: {
    color: '#50b2e3',
    fontSize: 17,
  },
  name: {
    fontWeight: 'bold',
    fontSize: 20,
    color: 'black',
  },
  inputName: {
    borderBottomWidth: 1,
    borderBottomColor: 'black',
    width: '100%',
    fontSize: 14,
    color: 'black',
    marginRight: 10,
    height: 40,
    backgroundColor: 'white',
    marginTop: 5,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  mainContent: {
    flex: 4,
    backgroundColor: 'white',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  searchTitle: {
    fontWeight: 'bold',
    fontSize: 20,
    color: 'black',
    marginLeft: 20,
    marginTop: 20,
  },
  forButton: {
    alignItems: 'center',
  },
  iconContainer: {
    backgroundColor: '#005418',
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 15,
    margin: 10,
  },
});
