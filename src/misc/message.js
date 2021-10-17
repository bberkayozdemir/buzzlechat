import React from 'react'
import { StyleSheet, View, Text, Animated,Easing   } from 'react-native'
import {IconButton} from 'react-native-paper';
import Slider from '@react-native-community/slider';
import { millisToMinutesAndSeconds } from "./helpers"
import { storage } from "../fb"

import AudioController from "./audioController"

export default class Message extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            loaded:false,
            loading:false,
            playing:false,
            paused:false,
            sliderValue:0,
            currentTime:millisToMinutesAndSeconds(props.length),
            length:0,
            uri:""
        }

        this.rotation = new Animated.Value(0)
    }

    componentDidMount()
    {
        this.audio = new AudioController({update:async (state) => {
            return new Promise((resolve, reject) => {
                this.setState(state, () => resolve())
            })
            
        }})

        this.spin()
    }

    spin = () => {

        this.rotation.setValue(0);
        Animated.timing(
            this.rotation,
            {
                toValue: 1,
                duration: 1500,
                easing: Easing.linear,
                useNativeDriver: true
            }
        ).start(() => this.spin());

    };

    async play()
    {
        if (!this.state.loaded)
        {
            this.setState({loading:true})
            var uri = await storage.ref().child(this.props.name).getDownloadURL()
            this.setState({uri})
            var load = await this.audio.load(uri)

            if (this.props.rate !== "1")
            {
                await this.audio.effect(this.props.rate, true)
            }

            if (load !== false)
                this.audio.play()

            this.setState({loaded:true, loading:false})
        }else
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

    render()
    {
        const rotate = this.rotation.interpolate({inputRange: [0, 1], outputRange: ['0deg', '360deg']});

        return (
            <View style={this.props.me ? styles.messageMe : styles.message}>
                {this.state.loading && (
                    <Animated.View
                        style={{flex:1, transform: [{"rotate":rotate}], alignItems:"center", justifyContent: 'center'}}
                    >
                        <IconButton
                            icon="loading"
                            color="#fff"
                            size={24}
                        />
                    </Animated.View>
                )}

                {!this.state.loading && (
                    <View
                        style={{flex:1, alignItems:"center", justifyContent: 'center'}}
                    >
                    <IconButton
                        icon={this.state.playing ? "pause" : "play"}
                        color="#fff"
                        animated={true}
                        size={24}
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
                    </View>
                )}

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
            </View>
        )
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