import React from 'react'
import { StyleSheet, View, Image, Pressable, Text } from 'react-native'
import { ScrollView, TextInput } from 'react-native'
import { Appbar, IconButton, Avatar, TouchableRipple  } from 'react-native-paper';
import { db } from "../fb.js"

export default class Search extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            keyword:"",
            users:[]
        }
    }

    componentDidMount(){

    }

    search(){
        db.collection("users").where("username", ">=", this.state.keyword).get().then(querySnapshot => {
            var users = []
            querySnapshot.forEach((doc) => {
                users.push(doc.data())
            })
            console.log(users)
            this.setState({users})

        }).catch((error) => {
            console.log(error)
            this.setState({user:[]})
        })
    }

    render()
    {
        return (
            <>
                <Appbar>
                    <Appbar.BackAction onPress={() => this.props.navigation.goBack()} />
                    <Appbar.Content title="Arama" />
                </Appbar>

                <View style={{position: 'relative', justifyContent: 'center'}}>
                    <TextInput onChangeText={(keyword) => this.setState({keyword})} placeholder="Bir kullanıcı ara..." style={styles.input} />
                    <IconButton
                        icon="magnify"
                        color="#393841"
                        size={24}
                        onPress={this.search.bind(this)}
                        style={styles.searchBtn}
                    />
                </View>

                <View style={styles.list}>
                    {this.state.users.map((user, index) => (
                        <TouchableRipple key={index} onPress={() => this.props.navigation.navigate({name:"Conversation", params:{id:user.uid, username:user.username}})} rippleColor="rgba(0, 0, 0, .32)">
                            <View style={styles.listItem}>
                                <Avatar.Text size={24} label={user.name[0] + user.surname[0]} />
                                <Text style={{paddingLeft:10}}>{user.username}</Text>
                            </View>
                        </TouchableRipple>
                    ))}
                </View>
            </>
          );
        
    }

}

const styles = StyleSheet.create({
    input:{
        backgroundColor:"#ECECEC",
        paddingTop:10,
        paddingBottom:10,
        paddingLeft:15,
        paddingRight:15,
        borderRadius:5
    },
    searchBtn:{
        position:"absolute",
        right:0
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