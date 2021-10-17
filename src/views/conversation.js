import React from 'react'
import { StyleSheet, View, Text } from 'react-native'
import { ScrollView } from 'react-native'
import { Appbar, IconButton} from 'react-native-paper'
import Slider from '@react-native-community/slider'
import Recorder from "../misc/recorder"
import { db, storage } from "../fb"
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';
import Message from "../misc/message.js"
import {sendPushNotification} from "../misc/helpers"

export default class Conversation extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            isRecording:false,
            editing:false,
            effect:"robot",
            recording:null,
            recordedSound:"",
            loaded:false,
            sound:null,
            sliderValue:0,
            sliderMax:0,
            currentTimeValue:0,
            currentTime:"0:00",
            playing:false,
            paused:false,
            played:false,
            modified:false,

            messages:[]
        }

        this.doc = null

        if (typeof this.props.route.params.doc !== "undefined")
            this.doc = this.props.route.params.doc

        this.stopTick = false

        console.log(props)

        this.upload = {blob:"", length:0}
    }

    componentDidMount() {
        if (this.doc != null)
            this.listen()
    }

    listen()
    {
        db.collection("THREADS").doc(this.doc).collection("MESSAGES").orderBy("date").onSnapshot((querySnapshot) => {
            console.log("new")
            const messages = querySnapshot.docs.map(doc => {

                doc = doc.data()
                
                return {
                    date:doc.date,
                    me:global.user.uid === doc.from ? true : false,
                    name:doc.voice,
                    length:doc.ms,
                    rate:doc.rate
                }
            })

            this.setState({ messages })
            console.log("mesajlar")
            console.log(messages)
        })
    }

    async sendMessage(path, length, rate, onFinish)
    {
        var res = await fetch(path)
        var blob = await res.blob()
        this.upload.blob = blob
        this.upload.length = length
        this.upload.rate = rate

        if (this.doc == null)
            return this.createDocAndSendMessage(onFinish)

        var doc = await db.collection("THREADS").doc(this.doc).get()
        if (!doc.exists)
             createDocAndSendMessage(onFinish)
        else
            this._sendMessage(db.collection("THREADS").doc(this.doc), onFinish)
    }

    createDocAndSendMessage(onFinish)
    {
        db.collection("THREADS").add({
            users:[
                global.user.uid,
                this.props.route.params.id
            ],
            user0name:global.user.username,
            user1name: this.props.route.params.username,
            latestMessage:{
                ms:this.upload.length,
                from:global.user.uid,
                date: new Date().getTime()
            }
        }).then(dockRef => {
            this.doc = dockRef.id
            this._sendMessage(dockRef, onFinish)
        })
    }

    async _sendMessage(dockRef, onFinish)
    {
        try{
            var uploadname = `${dockRef.id}/${uuidv4()}.m4a`
            var ref = storage.ref().child(uploadname)
            var upload = await ref.put(this.upload.blob)

            await dockRef.collection("MESSAGES").add({
                voice:uploadname,
                ms:this.upload.length,
                date: new Date().getTime(),
                from:global.user.uid,
                rate:this.upload.rate
            })

            await dockRef.set({
                latestMessage:{
                    ms:this.upload.length,
                    date: new Date().getTime(),
                    from:global.user.uid
                }
            },
            { merge: true }
            )

            onFinish()

            //notify
            var res = await db.collection("users").where("uid", "==", this.props.route.params.id).get()
            var token;
            res.forEach((doc) => token = doc.data().pushToken )
            console.log("sending to " + token)
            sendPushNotification(token)
        }catch (err) {
            console.log(err)
            alert("Mesaj gönderilemedi")
        }
    }

    render()
    {
        return (
            <>
                <Appbar>
                    <Appbar.BackAction onPress={() => this.props.navigation.goBack()} />
                    <Appbar.Content title={this.props.route.params.username} />
                </Appbar>

                <ScrollView style={{flex: 1,paddingHorizontal: 15}}>
                    {this.state.messages.map((message, index) => (
                        <Message
                            key={index}
                            name={message.name}
                            me={message.me}
                            length={message.length}
                            date={message.date}
                            rate={message.rate}
                        />
                    ))}
                    <View style={{height:60}}></View>
                </ScrollView>

                <Recorder
                    onSend={this.sendMessage.bind(this)}
                />
                
            </>
          );
        
    }

}

const styles = StyleSheet.create({
    message:{
        backgroundColor:"#303030",
        flexDirection:"row",
        alignItems:"center",
        marginVertical:10,
        width:"75%",
        borderRadius:5
    },
    messageMe:{
        backgroundColor:"#303030",
        flexDirection:"row",
        alignItems:"center",
        marginVertical:10,
        width:"75%",
        alignSelf:"flex-end",
        borderRadius:5
    },
})