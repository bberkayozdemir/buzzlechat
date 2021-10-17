import React from 'react'
import { StyleSheet, View, Text } from 'react-native'
import {IconButton,  TouchableRipple, ActivityIndicator} from 'react-native-paper';
import Slider from '@react-native-community/slider';
import {Picker} from '@react-native-picker/picker';
import { Audio } from "expo-av"

import AudioController from "./audioController"

export default class Recorder extends React.Component{

    constructor(props) {
        super(props)
        this.props = props

        this.state = {
            isRecording:false,
            recording:null,
            playing:false,
            paused:false,
            sliderValue:0,
            currentTime:"0:00",
            length:0,
            uri:"",
            loading:false
        }
    }

    componentDidMount()
    {
        this.audio = new AudioController({update:(state) => {
            this.setState(state)
        }})
    }

    async record()
    {
        try
        {
            console.log('Requesting permissions..');
            await Audio.requestPermissionsAsync();
            await Audio.setAudioModeAsync({
              allowsRecordingIOS: true,
              playsInSilentModeIOS: true,
            }); 
            console.log('Starting recording..');
            const { recording } = await Audio.Recording.createAsync(
               Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY
            );
            this.setState({ recording, isRecording:true })
            console.log('Recording started');
          } catch (err) {
            console.error('Failed to start recording', err);
            this.setState({ isRecording:false })
          }
    }

    async stopRecording()
    {     
        console.log('Stopping recording..')
        await this.state.recording.stopAndUnloadAsync()
        const uri = this.state.recording.getURI()
        console.log('Recording stopped and stored at', uri)

        var load = await this.audio.load(uri)

        if (load !== false)
            this.setState({editing:true})
    }

    play()
    {
        this.audio.play()
    }

    pause()
    {
        this.audio.pause()
    }

    resume()
    {
        this.audio.resume()
    }

    setPositionms(val)
    {
        this.audio.setPosition(val)
    }

    async delete()
    {
        await this.audio.delete()

        this.setState({editing:false,isRecording:false,recording:null})
    }

    setEffect(effect)
    {
        this.audio.effect(effect)
    }

    componentWillUnmount()
    {
        this.audio.unLoad()
    }

    async submit()
    {
        this.setState({loading:true})
        var rate = await this.audio.getRate()
        this.props.onSend(this.state.uri, this.state.length, rate, () =>{
            this.setState({loading:false,editing:false,isRecording:false,recording:null})
            this.audio.delete()
        })
    }

    render()
    {
        return (
            <>
                {!this.state.editing && (
                    <View style={styles.microPhoneCont} >
                        <IconButton
                            icon={this.state.isRecording ? "stop" :"microphone"}
                            color="#fff"
                            size={60}
                            onPress={() => this.state.isRecording ? this.stopRecording() : this.record()}
                            style={this.state.isRecording ? styles.microPhoneStop : styles.microPhone}
                            animated={true}
                        />
                    </View>
                )}

                {this.state.editing && (
                    <View style={styles.edit}>
                        {this.state.loading && (
                            <View style={{width:"100%", height:"100%",justifyContent:"center",alignItems:"center"}}>
                                <ActivityIndicator size="large" color="#393841"/>
                            </View>
                        )}
                        {!this.state.loading && (
                            <>
                                <View style={styles.editBox}>
                                    <IconButton
                                        icon={this.state.playing ? "pause" : "play"}
                                        color="#fff"
                                        size={24}
                                        animated={true}
                                        onPress={() => {
                                            if (this.state.playing && !this.state.paused)
                                                this.pause()
                                            else if (!this.state.playing && this.state.paused)
                                                this.resume()
                                            else
                                                this.play()
                                        }}
                                        style={{flex:1}}
                                    />
                                    <Slider
                                        style={{flex:5}}
                                        minimumValue={0}
                                        maximumValue={1}
                                        minimumTrackTintColor="#FFFFFF"
                                        maximumTrackTintColor="#000000"
                                        thumbTintColor="#fff"
                                        value={this.state.sliderValue}
                                        onSlidingComplete={(val) => {this.setPositionms(val)}}
                                    />
                                    <Text style={{color:"#fff", flex:1}}>
                                        {this.state.currentTime}
                                    </Text>
                                    <IconButton
                                        icon="delete"
                                        color="#ff0000"
                                        size={24}
                                        onPress={() => {this.delete()}}
                                        style={{flex:1}}
                                    />
                                </View>
                                <View style={{flexDirection:"row",width:"90%"}}>
                                    <View style={styles.button}> 
                                        <Picker
                                            selectedValue="none"
                                            style={{color:"#fff", textAlign:"center"}}
                                            onValueChange={(itemValue, itemIndex) =>
                                                this.setEffect(itemValue)
                                            }>
                                            <Picker.Item label="Ses Efekti" value="none" />
                                            <Picker.Item label="Normal" value="normal" />
                                            <Picker.Item label="Kalın" value="kalin" />
                                            <Picker.Item label="İnce" value="ince" />
                                            <Picker.Item label="Ağır Çekim" value="agircekim" />
                                            <Picker.Item label="Hızlı" value="hizli" />
                                            
                                        </Picker>
                                    </View>
                                    <TouchableRipple style={styles.button2} onPress={() => this.submit()}> 
                                        <Text style={{color:"#fff",textAlign:"center",fontSize:16}}>Gönder</Text>
                                    </TouchableRipple>
                                </View>
                            </>
                        )}
                    </View>
                )}
            </>
        )
    }

}


const styles = StyleSheet.create({
    button:{
        borderRadius:5,
        backgroundColor:"#2B2A33",
        flex:1,
        paddingVertical:10
    },
    button2:{
        borderRadius:5,
        backgroundColor:"#2B2A33",
        flex:1,
        paddingVertical:10,
        marginLeft:5
    },
    edit:{
        alignItems:"center",
        backgroundColor:"#494752",
        paddingHorizontal:15,
        paddingVertical:15,
        height:150
    },
    editBox:{
        flexDirection:"row",
        alignItems:"center",
        borderRadius:5,
        backgroundColor:"#2B2A33",
        width:"90%",
        marginVertical:10,
    },
    microPhone:{
        borderRadius:100,
        backgroundColor:"#303030"
    },
    microPhoneStop:{
        borderRadius:100,
        backgroundColor:"red"
    },
    microPhoneCont:{
        alignItems:"center",
        paddingBottom:20
    }
})