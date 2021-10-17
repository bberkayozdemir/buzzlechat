import React from 'react'
import { StyleSheet, View, Image, Pressable, Text } from 'react-native'
import { ScrollView, TextInput } from 'react-native'
import { signInWithEmailAndPassword } from "../fb.js"
import { StackActions, NavigationActions } from 'react-navigation';

export default class Login extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            email:"",
            password:""
        }
    }

    async login()
    {
        if (!this.state.email || !this.state.password)
            return alert("Tüm alanları doldurunuz!")

        if (!new RegExp(/^(("[\w-\s]+")|([\w-]+(?:\.[\w-]+)*)|("[\w-\s]+")([\w-]+(?:\.[\w-]+)*))(@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$)|(@\[?((25[0-5]\.|2[0-4][0-9]\.|1[0-9]{2}\.|[0-9]{1,2}\.))((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\.){2}(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\]?$)/i).test(this.state.email))
            return alert("Geçerli bir email adresi giriniz!")
        
        const login = await signInWithEmailAndPassword(this.state.email, this.state.password)

        if (login)
            this.props.navigation.reset({
                index: 0,
                routes: [{ name: 'Home' }],
              });
    }

    render(){
        return (
            <View style={styles.mainContainer}>
                <View style={styles.logoWrapper}>
                    <Image style={styles.logo} source={require('../images/logo-black.png')}/>
                </View>

                <View style={{marginTop:20}}>
                    <TextInput placeholder="E-Posta Adresi" style={styles.input} onChangeText={(email) => this.setState({ email })}/>
                </View>

                <View style={{marginTop:20}}>
                    <TextInput secureTextEntry placeholder="Şifre" style={styles.input} onChangeText={(password) => this.setState({ password })}/>
                </View>

                <Pressable onPress={this.login.bind(this)} style={styles.button}>
                    <Text style={{color:"#fff"}}>Giriş Yap</Text>
                </Pressable>

                <View style={{alignItems:"center",marginTop:20}}>
                    <Text>Hesabın yok mu? <Pressable onPress={() => this.props.navigation.goBack()}><Text style={styles.login}>üye ol</Text></Pressable></Text>
                    
                </View>
            </View>
        )
    }

}

const styles = StyleSheet.create({
    logo: {
        width:250,
        resizeMode: "contain",
    },
    logoWrapper: {
        width:"100%",
        alignItems: "center",
        marginBottom:20
    },
    mainContainer:{
        width:"100%",
        paddingLeft:10,
        paddingRight:10,
        justifyContent: "center",
        height:"100%"
    },
    input:{
        backgroundColor:"#ECECEC",
        paddingTop:10,
        paddingBottom:10,
        paddingLeft:8,
        paddingRight:8,
        borderRadius:5
    },
    button:{
        width:"100%",
        alignItems: "center",
        marginTop:20,
        backgroundColor:"#393841",
        color:"#fff",
        paddingVertical:15,
        borderRadius:5
    },
    gbutton:{
        width:"100%",
        alignItems: "center",
        marginTop:20,
        backgroundColor:"#DB4437",
        color:"#fff",
        paddingVertical:15,
        borderRadius:5
    },
    login:{
        textDecorationLine: "underline",
        textDecorationStyle: "solid",
        textDecorationColor: "#000",
        top:3
    }
})