import { StyleSheet, Text, View, Image, ToastAndroid } from "react-native";
import React, { useEffect, useState } from "react";
import axios_config from "../config/axios_config";
import { colors } from "../config/colors";
import { Dimensions } from "react-native";
import { SafeAreaView } from "react-native";
import { StatusBar } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { TouchableOpacity } from "react-native";
import { ScrollView } from "react-native";
import CardList from "../components/CardList";
import { BackSvg, HeartOutlineSvg, HeartSolidSvg } from "../components/svg";
import { connect } from "react-redux";
import { setFavorites } from "../redux";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { common_styles } from "../config/externalstyles";
import { badges } from "../var";
const { width, height } = Dimensions.get("screen");
export const carousel_height = height - 250;

const Info = (props) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [movieInfo, setMovieInfo] = useState(null);
  const setFavoriteFromStorage = async (newFavorite) => {
    try {
      await AsyncStorage.setItem(
        "favorite_storage",
        JSON.stringify(newFavorite)
      );
    } catch (e) {
      console.log("Warning set in Info.js: " + e);
    }
  };
  const heartHandler = () => {
    const newData = props.tempInfo;
    if (
      props?.favorite.filter((i) => i.id == props?.tempInfo?.id)?.length > 0
    ) {
      ToastAndroid.show("Movie Remove to Favorite's.", ToastAndroid.SHORT);
      let newFavorite = [
        ...props?.favorite.filter((i) => i.id != props?.tempInfo?.id),
      ];
      props.setFavorites(newFavorite);
      setFavoriteFromStorage(newFavorite);
    } else {
      ToastAndroid.show("Added to Favorite Movie", ToastAndroid.SHORT);
      let newFavorite = [...new Set([...props?.favorite, newData])];
      props.setFavorites(newFavorite);
      setFavoriteFromStorage(newFavorite);
    }

    setIsFavorite(!isFavorite);
  };
  const [error, setError] = useState(false);
  const watchHandler = async (item) => {
    props.navigation.navigate({
      name: `watch_page`,
      params: {
        item,
      },
      merge: true,
    });
  };
  const load = async (id, type) => {
    let count = 0;
    await axios_config
      .get("info/" + id + "?type=" + type)
      .then((res) => {
        count += 1;

        setMovieInfo(res.data);
      })
      .catch((e) => {
        if (e?.message != "Network Error") {
          setError(1);
        } else {
          setError(2);
        }
        console.log(e?.message);
      });
  };

  useEffect(() => {
    const data = props.route.params?.item;
    load(data.id, data.type);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar />
      {movieInfo ? (
        <View>
          <LinearGradient
            x={10}
            style={styles.header}
            colors={["rgba(0,0,0,0)", "transparent"]}
          >
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => props.navigation.goBack()}
            >
              <View style={styles.navigation}>
                <BackSvg />
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => heartHandler()}
            >
              <View style={styles.navigation}>
                {props?.favorite.filter((i) => i.id == props?.tempInfo?.id)
                  ?.length > 0 ? (
                  <HeartSolidSvg />
                ) : (
                  <HeartOutlineSvg />
                )}
              </View>
            </TouchableOpacity>
          </LinearGradient>
          <ScrollView>
            <View style={styles.carousel}>
              <View>
                <Image
                  blurRadius={2}
                  resizeMode="cover"
                  style={{
                    position: "absolute",
                    zIndex: 0,
                    width: width,
                    height: carousel_height,
                  }}
                  source={{ uri: movieInfo?.image }}
                />
                <Image
                  style={{
                    width: width,
                    resizeMode: "contain",
                    height: carousel_height,
                  }}
                  source={{ uri: movieInfo?.image }}
                />
              </View>
              <LinearGradient
                x={10}
                style={styles.gradient}
                colors={["transparent", "rgba(0,0,0,1)"]}
              />
              <View style={styles.card_image}>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => watchHandler(movieInfo)}
                >
                  <View style={styles.play_btn}>
                    <Image
                      source={require("../assets/images/play.png")}
                      style={{
                        width: width * 0.05,
                        height: width * 0.05,
                        margin: 25,
                        resizeMode: "contain",
                      }}
                    />
                  </View>
                </TouchableOpacity>
              </View>
              <View
                style={{
                  padding: 10,
                  paddingBottom: 5,
                  zIndex: 2,
                  width,
                  position: "absolute",
                  bottom: 0,
                }}
              >
                <View
                  style={{
                    flex: 1,
                    flexDirection: "row",
                    justifyContent: "space-between",
                  }}
                >
                  {movieInfo?.type ? (
                    <Text style={styles.episode_text}>{movieInfo?.type}</Text>
                  ) : (
                    <Text />
                  )}
                  {movieInfo?.rating && (
                    <Text style={styles.ratings_text}>
                      Ratings:{" "}
                      <Text style={{ color: colors.green }}>
                        {movieInfo?.rating}%
                      </Text>
                    </Text>
                  )}
                </View>
                <Text numberOfLines={2} style={styles.title}>
                  {movieInfo?.title}
                </Text>
                <View
                  style={{
                    flex: 1,
                    alignItems: "center",
                    flexDirection: "row",
                    flexWrap: "wrap",
                    gap: 10,
                  }}
                >
                  {badges?.map((keys, index) => (
                    <Text style={styles.badge} key={index}>
                      {"releaseDate" == keys
                        ? `Released Date: ${movieInfo[keys].split("-")[0]}`
                        : ""}
                      {"duration" == keys && movieInfo[keys]}

                      {"duration" == keys ? `mins` : ""}
                    </Text>
                  ))}
                </View>
                <Text style={styles.label}>Genres:</Text>
                <Text style={styles.genres}>
                  {movieInfo?.genres?.join(", ")}
                </Text>
              </View>
            </View>
            <Text style={[styles.label, { paddingHorizontal: 10 }]}>
              Description:
            </Text>
            <View>
              <Text style={styles.description}>
                {movieInfo?.description?.split("<br>").join(" ") ||
                  "No available description."}
              </Text>
            </View>
            <View style={{ padding: 10 }} />

            {movieInfo?.similar?.length > 0 && (
              <CardList
                title="Similar Movies"
                data={movieInfo?.similar}
                {...props}
              />
            )}

            {movieInfo?.recommendations?.length > 0 && (
              <CardList
                title="Recommendations"
                data={movieInfo?.recommendations}
                {...props}
              />
            )}

            <View style={{ padding: 10 }} />
          </ScrollView>
        </View>
      ) : (
        <View style={styles.error_card}>
          {error > 0 ? (
            <View>
              {error == 1 ? (
                <>
                  <Text style={styles.simple_text}>
                    Sorry but server is too busy as of now.{"\n"} Try again
                    after 1 minute!
                  </Text>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => props.navigation.goBack()}
                  >
                    <View style={{ alignItems: "center" }}>
                      <Text
                        style={[
                          styles.episode_text,
                          { fontSize: 15, marginTop: 10 },
                        ]}
                      >
                        Go Back
                      </Text>
                    </View>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <Text style={[styles.simple_text, { margin: 30 }]}>
                    Something went wrong. Please make sure you are connected to
                    the internet.
                  </Text>
                  <TouchableOpacity activeOpacity={0.6} onPress={load}>
                    <View style={{ alignItems: "center" }}>
                      <Text
                        style={[
                          styles.episode_text,
                          { fontSize: 15, marginTop: 10 },
                        ]}
                      >
                        Reload
                      </Text>
                    </View>
                  </TouchableOpacity>
                </>
              )}
            </View>
          ) : (
            <Text style={styles.simple_text}>Fetching Data. Please Wait.</Text>
          )}
        </View>
      )}
    </SafeAreaView>
  );
};
const mapStateToProps = (state) => {
  return {
    favorite: state.favorite.favorite,
    tempInfo: state.watch.temp_info,
  };
};
export default connect(mapStateToProps, { setFavorites })(Info);

const styles = StyleSheet.create({
  ...common_styles({ width, carousel_height, height }),
  description: {
    opacity: 0.85,
    // marginBottom: 20,
    fontFamily: "montserrat_medium",
    color: colors.white,
    textAlign: "justify",
    lineHeight: 23,
    padding: 10,
    fontSize: 15,
    paddingVertical: 5,
  },
  genres: {
    fontFamily: "montserrat_medium",
    color: colors.white,
    opacity: 0.85,
    fontSize: 15,
  },
});
