import React, { useEffect } from 'react'
import Constants from 'expo-constants';
import {NavigationContainer} from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import {DefaultTheme, Provider as PaperProvider } from 'react-native-paper';

import Login from "./src/views/login.js"
import Register from "./src/views/register.js"
import Home from "./src/views/home.js"
import Search from "./src/views/search.js"
import Conversation from "./src/views/conversation.js"

import { StatusBar } from 'react-native';
import * as Notifications from 'expo-notifications';
const Stack = createStackNavigator();

const theme = {
  ...DefaultTheme,
  roundness: 2,
  colors: {
    ...DefaultTheme.colors,
    primary: '#393841',
    accent: '#FFFFFF',
  },
};

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function App() {
  
  useEffect(() =>{
    register()
    return () => {}
  }, [])

  async function register(){
    console.log("************************************")
    var token = await registerForPushNotificationsAsync()
    console.log("************************************")
    console.log(token)
    global.notificationToken = token
  }

  return (
    <PaperProvider theme={theme}>
      
      <NavigationContainer>
        <Stack.Navigator screenOptions={{headerShown:false}} initialRouteName="Register">
          <Stack.Screen name="Login" component={Login} />
          <Stack.Screen name="Register" component={Register} />
          <Stack.Screen name="Home" component={Home} />
          <Stack.Screen name="Search" component={Search} />
          <Stack.Screen name="Conversation" component={Conversation} />
        </Stack.Navigator>
      </NavigationContainer>
      <StatusBar/>
    </PaperProvider>
  );
}

async function registerForPushNotificationsAsync() {
  let token;
  if (Constants.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      alert('Failed to get push token for push notification!');
      return;
    }
    token = (await Notifications.getExpoPushTokenAsync()).data;
    console.log(token);
  } else {
    alert('Must use physical device for Push Notifications');
  }

  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  return token;
}