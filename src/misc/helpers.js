export const millisToMinutesAndSeconds = (millis) => {
    var minutes = Math.floor(millis / 60000);
    var seconds = ((millis % 60000) / 1000).toFixed(0);
    return minutes + ":" + (seconds < 10 ? '0' : '') + seconds;
}

export const sendPushNotification = async (expoPushToken) => {
    try{
        const message = {
        to: expoPushToken,
        sound: 'default',
        title: 'Mesajın var',
        body: 'biri sana mesaj gönderdi!',
        data: { someData: 'goes here' },
        };
    
        await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Accept-encoding': 'gzip, deflate',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
        });

    return true
    } catch (err) {
        console.log(err)
        return false
    }
  }