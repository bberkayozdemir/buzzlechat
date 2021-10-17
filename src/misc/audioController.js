import { Audio } from "expo-av"
import { millisToMinutesAndSeconds } from "./helpers"

const updateMs = 500

export default class AudioController {

    constructor(props)
    {
        this.props = props
        this.sound = new Audio.Sound()

        this.timer = null
        this.uri = null
        this.sliderValue = 0
        this.length = 0
        this.currentTimeValue = 0
        this.currentTime = "0:00"

        this.playing = false
        this.paused = false
        this.played = false
        this.modified = false
        this.stopTick = false
    }

    async load(uri)
    {
        try
        {
            console.log("loading audio")
            await this.sound.loadAsync({ uri })
            var status = await this.sound.getStatusAsync()
            console.log(status)

            this.timer = null
            this.uri = uri
            this.sliderValue = 0
            this.length = status.playableDurationMillis
            this.currentTimeValue = 0
            this.currentTime = millisToMinutesAndSeconds(status.playableDurationMillis)
            this.playing = false
            this.paused = false
            this.played = false
            this.modified = false
            this.stopTick = false

            this.props.update({
                currentTime: this.currentTime,
                playing:false,
                paused:false,
                sliderValue:0,
                uri,
                length:this.length,
            })

            return true

        }
        catch(e){
            console.log(e)
            return false
        }
        

    }

    async unLoad()
    {
        console.log("unloading")
        try{
            await this.sound.unloadAsync()
        }catch(err){
            console.log(err)
        }

        return true
    }

    async delete()
    {
        console.log("deleting")
        try{
            await this.sound.unloadAsync()
        }catch(err){
            console.log(err)
        }

        clearInterval(this.timer)
        return true
    }

    play()
    {
        console.log("playing")
        if (this.played && !this.modified)
            this.sound.replayAsync()
        else
            this.sound.playAsync()

        this.sliderValue = 0
        this.currentTimeValue = 0
        this.currentTime = "0:00"
        this.playing = true

        this.props.update({
            sliderValue:this.sliderValue,
            currentTime:this.currentTime,
            playing:true
        })

        this.tick()
        this.timer = setInterval(() => {
            this.tick()
        }, updateMs)
    }

    async pause()
    {
        console.log("pausing")
        await this.sound.setStatusAsync({
            shouldPlay:false
        })

        this.stopTick = true
        clearInterval(this.timer)

        this.playing = false
        this.paused = true
        this.modified = false

        this.props.update({
            playing:this.playing,
            paused:this.paused,
        })

        return true
    }

    async resume()
    {
        try{
            console.log("resuming")
            await this.sound.setStatusAsync({
                shouldPlay:true
            })

            this.stopTick = false
            this.playing = true
            this.paused = false
            this.modified = false

            this.props.update({
                playing: this.playing,
                paused:this.paused,
            })

            this.tick()
            this.timer = setInterval(() => {
                this.tick()
            }, updateMs)
        }catch (err) {
            console.log(err)
        }
    }

    async setPosition(val)
    {
        if (this.playing)
            return;

        this.currentTimeValue = this.length * val
        this.currentTime = millisToMinutesAndSeconds(this.currentTimeValue)

        await this.sound.setStatusAsync({
            positionMillis:this.currentTimeValue,
            shouldPlay:false
        })

        this.props.update({
            currentTime:this.currentTime
        })
        
        this.modified = true
    }

    async tick()
    {
        console.log("tick")
        
        if (this.currentTimeValue > this.length || this.stopTick)
        {
            clearInterval(this.timer)
            if (!this.stopTick){
                console.log("finished")

                this.sliderValue = 0
                this.currentTimeValue = 0
                this.playing = false
                this.played = true

                var status = await this.sound.getStatusAsync()
                this.currentTime = millisToMinutesAndSeconds(status.playableDurationMillis)

                this.props.update({
                    sliderValue:0,
                    currentTimeValue:0,
                    playing:false,
                    played:true,
                    currentTime:this.currentTime,
                })
            }
            return
        }

        let sliderValue = this.currentTimeValue / this.length

        if (sliderValue > 1)
            sliderValue = 1

        this.sliderValue = sliderValue
        this.currentTime = millisToMinutesAndSeconds(this.currentTimeValue)
        this.currentTimeValue = this.currentTimeValue + 500
        this.modified = false

        this.props.update({
            sliderValue: this.sliderValue,
            currentTime:this.currentTime,
        })
    }

    async getRate()
    {
        var status = await this.sound.getStatusAsync()
        return status.rate
    }

    async effect(type, custom = false) //0.75, 2.5, 3, 0.6
    {
        try
        {
            console.log("appyling pitch")
            await this.pause()

            if (!custom)
            {
                if (type === "none" || type === "normal")
                    await this.sound.setRateAsync(1)
                else if (type === "kalin")
                    await this.sound.setRateAsync(0.75)
                else if (type === "ince")
                    await this.sound.setRateAsync(1.5)
                else if (type === "agircekim")
                    await this.sound.setRateAsync(0.6)
                else if (type === "hizli")
                    await this.sound.setRateAsync(2.5)
            }
            else
                await this.sound.setRateAsync(type)

            await this.sound.setStatusAsync({
                shouldPlay:false,
                positionMillis:0
            })

            var status = await this.sound.getStatusAsync()
            console.log(status)

            this.timer = null
            this.sliderValue = 0
            this.length = status.playableDurationMillis
            this.currentTimeValue = 0
            this.currentTime = millisToMinutesAndSeconds(status.playableDurationMillis)
            this.playing = false
            this.paused = false
            this.played = false
            this.modified = false
            this.stopTick = false

            await this.props.update({
                currentTime: this.currentTime,
                playing:false,
                paused:false,
                sliderValue:0,
                length:this.length,
            })

            return true
        }catch (err) {
            console.log(err)
            return false
        }
        
    }

}