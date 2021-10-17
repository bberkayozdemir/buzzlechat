import React from 'react'
import { StyleSheet, View, Image, Pressable, Text } from 'react-native'
import { ActivityIndicator, ScrollView, TextInput } from 'react-native'
import { registerWithEmailAndPassword, auth, getUserDatas, savePushToken } from "../fb.js"
import { StackActions, NavigationActions } from 'react-navigation'

export default class Register extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            name:"",
            surname:"",
            email:"",
            password:"",
            loaded:false
        }
    }

    componentDidMount(){
        auth.onAuthStateChanged(async (user) => {
            if (user) {
                global.user = await getUserDatas(user.uid)
                savePushToken(user.uid, global.notificationToken)
                this.props.navigation.reset({
                    index: 0,
                    routes: [{ name: 'Home' }],
                });
                return;
            }

            this.setState({loaded: true})
        });
    }

    async register()
    {
        if (!this.state.name || !this.state.surname || !this.state.email || !this.state.password)
            return alert("Tüm alanları doldurunuz!")

        if (!new RegExp(/^(("[\w-\s]+")|([\w-]+(?:\.[\w-]+)*)|("[\w-\s]+")([\w-]+(?:\.[\w-]+)*))(@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$)|(@\[?((25[0-5]\.|2[0-4][0-9]\.|1[0-9]{2}\.|[0-9]{1,2}\.))((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\.){2}(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\]?$)/i).test(this.state.email))
            return alert("Geçerli bir email adresi giriniz!")
        
        const register = await registerWithEmailAndPassword(this.state.name, this.state.surname, this.state.email, this.state.password)

        if (register)
            this.props.navigation.reset({
                index: 0,
                routes: [{ name: 'Home' }],
            });
    }

    render(){
        return (
            <>
                {!this.state.loaded && (
                    <View style={[styles.container, styles.horizontal]}>
                        <ActivityIndicator size="large" color="#393841" />
                    </View>
                )}

                {this.state.loaded && (
                    <View style={styles.mainContainer}>
                        <View style={styles.logoWrapper}>
                            <Image style={styles.logo} source={require('../images/logo-black.png')}/>
                        </View>
                        <View style={{flexDirection:"row"}}>
                            <View style={{flex:1}}>
                                <TextInput placeholder="Ad" style={styles.input} onChangeText={(name) => this.setState({ name })}/>
                            </View>
                            <View style={{flex:1,paddingLeft:20}}>
                                <TextInput placeholder="Soyad" style={styles.input} onChangeText={(surname) => this.setState({ surname })}/>
                            </View>
                        </View>

                        <View style={{marginTop:20}}>
                            <TextInput placeholder="E-Posta Adresi" style={styles.input} onChangeText={(email) => this.setState({ email })}/>
                        </View>

                        <View style={{marginTop:20}}>
                            <TextInput secureTextEntry placeholder="Şifre" style={styles.input} onChangeText={(password) => this.setState({ password })}/>
                        </View>

                        <Pressable onPress={this.register.bind(this)} style={styles.button}>
                            <Text style={{color:"#fff"}}>Üye Ol</Text>
                        </Pressable>

                        <View style={{alignItems:"center",marginTop:20}}>
                            <Text>Zaten hesabın varmı? <Pressable onPress={() => this.props.navigation.navigate("Login")}><Text style={styles.login}>giriş yap</Text></Pressable></Text>
                            
                        </View>
                    </View>
                )}
                
            </>
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
    },
    container: {
        flex: 1,
        justifyContent: "center"
      },
      horizontal: {
        flexDirection: "row",
        justifyContent: "space-around",
        padding: 10
      }
})