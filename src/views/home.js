import React from 'react'
import { StyleSheet, View, Image, Pressable, Text } from 'react-native'
import { ScrollView, TextInput } from 'react-native'
import { Appbar, FAB, Avatar, TouchableRipple} from 'react-native-paper';
import { db, logout } from "../fb"
import { millisToMinutesAndSeconds } from "../misc/helpers"
import {Picker} from '@react-native-picker/picker';
import * as Application from 'expo-application';

export default class Home extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            conversations:[],
            empty:false
        }

        this.popup = React.createRef()

        console.log(Application.applicationName)
    }

    async signout()
    {
        await logout()
        this.props.navigation.reset({
            index: 0,
            routes: [{ name: 'Register' }],
        });
    }

    componentDidMount(){
        db.collection("THREADS").where("users", "array-contains", global.user.uid).onSnapshot((querySnapshot) => {
            console.log("new")
            const convs = querySnapshot.docs.map(doc => {
                var docid = doc.id
                doc = doc.data()

                var index = 0
                if (doc.users[0] === global.user.uid)
                    index = 1

                var uicon = doc["user"+index+"name"].split(" ")
                var icon = uicon[0][0]+uicon[1][0]

                var lastme = doc.latestMessage.from === global.user.uid ? true : false
                
                return {
                    icon,
                    username:doc["user"+index+"name"],
                    uid:doc.users[index],
                    doc:docid,
                    lastme,
                    lastms:doc.latestMessage.ms,
                    lastdate:doc.latestMessage.date
                }
            })

            if (convs.length === 0)
                this.setState({ conversations: [], empty:true })
            else
                this.setState({ conversations: convs, empty:false })
            console.log(convs)
        })

        
    }

    render()
    {
        return (
            <>
                <Appbar>
                    <Appbar.Content title="buzzle" />
                    <Appbar.Action icon="dots-vertical" onPress={() => this.popup.current.focus()} />
                </Appbar>

                <View style={{opacity: 0, height:0,position: "absolute", top:-50}}>
                    <Picker
                        ref={this.popup}
                        selectedValue="menu"
                        onValueChange={(itemValue, itemIndex) =>
                            this.signout()
                        }>
                        <Picker.Item label="Menü" value="menu" />
                        <Picker.Item label="Çıkış Yap" value="logout" />
                        
                    </Picker>
                </View>

                <View style={styles.list}>
                    {this.state.conversations.map((user, index) => (
                        <TouchableRipple key={index} onPress={() => this.props.navigation.navigate({name:"Conversation", params:{id:user.uid, username:user.username, doc:user.doc}})} rippleColor="rgba(0, 0, 0, .32)">
                            <View style={styles.listItem}>
                                <Avatar.Text size={24} label={user.icon} />
                                <View style={{paddingLeft:10}}>
                                    <Text style={{}}>{user.username}</Text>
                                    <Text style={{fontSize:12}}>
                                        {user.lastme ? "Mesaj gönderdin" : "Sana mesaj gönderdi"} ({millisToMinutesAndSeconds(user.lastms)}) 
                                    </Text>
                                </View>
                            </View>
                        </TouchableRipple>
                    ))}
                </View>

                {this.state.empty && (
                    <View style={{height:"90%", width:"100%", alignItems:"center", justifyContent:"center"}}>
                        <Text>Henüz hiç mesajın yok</Text>
                    </View>
                )}

                <FAB
                    style={styles.fab}
                    large
                    icon="plus"
                    onPress={() => this.props.navigation.navigate("Search")}
                />
            </>
          );
        
    }

}

const styles = StyleSheet.create({
    fab: {
      position: 'absolute',
      margin: 16,
      right: 0,
      bottom: 0,
      backgroundColor:"#393841",
      color:"#fff"
    },
    list:{
        
    },
    listItem:{
        flexDirection:"row",
        paddingHorizontal:15,
        alignItems:'center',
        height:60,
        borderBottomWidth:1,
        borderColor:"#ececec"
    }
  })