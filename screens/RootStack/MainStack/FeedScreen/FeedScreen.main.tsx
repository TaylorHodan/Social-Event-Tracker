import React, { useState, useEffect } from "react";
import { View, FlatList, Text } from "react-native";
import { Appbar, Button, Card } from "react-native-paper";
import firebase from "firebase/app";
import "firebase/firestore";
import { SocialModel } from "../../../../models/social.js";
import { styles } from "./FeedScreen.styles";
import { StackNavigationProp } from "@react-navigation/stack";
import { MainStackParamList } from "../MainStackScreen.js";
import { Item } from "react-native-paper/lib/typescript/components/Drawer/Drawer";

/* 
  Remember the navigation-related props from Project 2? They were called `route` and `navigation`,
  and they were passed into our screen components by React Navigation automatically.  We accessed parameters 
  passed to screens through `route.params` , and navigated to screens using `navigation.navigate(...)` and 
  `navigation.goBack()`. In this project, we explicitly define the types of these props at the top of 
  each screen component.

  Now, whenever we type `navigation.`, our code editor will know exactly what we can do with that object, 
  and it'll suggest `.goBack()` as an option. It'll also tell us when we're trying to do something 
  that isn't supported by React Navigation!
*/
interface Props {
  navigation: StackNavigationProp<MainStackParamList, "FeedScreen">;
}

export default function FeedScreen({ navigation }: Props) {
  // List of social objects
  
  const [socials, setSocials] = useState<SocialModel[]>([]);

  const currentUserId = firebase.auth().currentUser!.uid;

  useEffect(() => {
    const db = firebase.firestore();
    const unsubscribe = db
      .collection("socials")
      .orderBy("eventDate", "asc")
      .onSnapshot((querySnapshot: any) => {
        var newSocials: SocialModel[] = [];
        querySnapshot.forEach((social: any) => {
          const newSocial = social.data() as SocialModel;
          newSocial.id = social.id;
          newSocials.push(newSocial);
        });
        setSocials(newSocials);
      });
    return unsubscribe;
  }, []);

  

  

  const renderSocial = ({ item }: { item: SocialModel }) => {
    const onPress = () => {
      navigation.navigate("DetailScreen", {
        social: item,
      });
    };

    let curUID = firebase.auth().currentUser!.uid;
  let deleteBin = <></>;
  if (curUID == item.uid) {
    deleteBin = <Button onPress = {deleteSocial}>Delete</Button>
  }
  let likeBin = <Button onPress = {toggleInterested}>{item.liked.includes(curUID) ? "Liked": "Like"}</Button>

  const toggleInterested = (social: SocialModel) => {
    // TODO: Put your logic for flipping the user's "interested"
    // status here, and call this method from your "like"
    // button on each Social card.
    if (item.liked.includes(curUID)) {
      let index = social.liked.indexOf(curUID);
      item.liked.splice(index,1);
    } else {
      item.liked.push(curUID);
    }
    firebase.firestore().collection("SocialModels").doc(item.id).update({liked: item.liked});
  };

  const deleteSocial = (social: SocialModel) => {
    // TODO: Put your logic for deleting a social here,
    // and call this method from your "delete" button
    // on each Social card that was created by this user.
    firebase.firestore().collection("SocialModels").doc(item.id).delete().then(() => {
      console.log("Document deleted");
    }).catch((error) => {
      console.error("Error removing the document: ", error);
    });

    const index = socials.indexOf(item);
    setSocials(socials.splice(index, 1));
  }

    return (
      <Card onPress={onPress} style={{ margin: 16 }}>
        <Card.Cover source={{ uri: item.eventImage }} />
        <Card.Title
          title={item.eventName}
          subtitle={
            item.eventLocation +
            " • " +
            new Date(item.eventDate).toLocaleString()
          }
        />
        {/* TODO: Add a like/interested button & delete soccial button. See Card.Actions
              in React Native Paper for UI/UX inspiration.
              https://callstack.github.io/react-native-paper/card-actions.html */}
        <Card.Actions>
          {deleteBin}
          {likeBin}
        </Card.Actions>
      </Card>
    );
  };

  const Bar = () => {
    return (
      <Appbar.Header>
        <Appbar.Action
          icon="exit-to-app"
          onPress={() => firebase.auth().signOut()}
        />
        <Appbar.Content title="Socials" />
        <Appbar.Action
          icon="plus"
          onPress={() => {
            navigation.navigate("NewSocialScreen");
          }}
        />
      </Appbar.Header>
    );
  };

  return (
    <>
      <Bar />
      <View style={styles.container}>
        <FlatList
          data={socials}
          renderItem={renderSocial}
          keyExtractor={(_: any, index: number) => "key-" + index}
          // TODO: Uncomment the following line, and figure out how it works
          // by reading the documentation :)
          // https://reactnative.dev/docs/flatlist#listemptycomponent

          ListEmptyComponent={<Text>Create a Social By Pressing +</Text>}
        />
      </View>
    </>
  );
}
