import {
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native";
import { StatusBar } from "react-native";
import axios_config from "../config/axios_config";
import { colors } from "../config/colors";
import { common_styles } from "../config/externalstyles";
import { BackSvg, CastSvg } from "../components/svg";
import { connect } from "react-redux";
import { ToastAndroid } from "react-native";
import { badges, temp_data } from "../var";
import { FlatList } from "react-native";
import WebView from "react-native-webview";

const { width, height } = Dimensions.get("screen");

const Watch = (props) => {
  const [player, setPlayer] = useState({
    image: null,
    video: null,
    quality: null,
    episode_number: null,
  });
  const [error, setError] = useState(false);
  const [movieInfo, setMovieInfo] = useState(temp_data);
  const [watchData, setWatchData] = useState(null);
  const [selectedSeason, setSelectedSeason] = useState("");
  const load = async () => {
    const { id, type } = props?.tempInfo;
    let count = 0;
    console.log(id, type);
    await axios_config
      .get("info/" + id + "?type=" + type)
      .then(async (res) => {
        count += 1;
        setMovieInfo(res.data);
        watchHandler(res.data);
      })
      .catch((e) => {
        console.log(e);
        if (e?.message != "Network Error") {
          setError(1);
        } else {
          setError(2);
        }
      });
  };
  const watchHandler = async (item, watch_episode) => {
    console.log("dito");
    setWatchData(null);
    setPlayer({
      image: null,
      video: null,
      episode_number: null,
    });
    if (!item?.seasons && !watch_episode) {
      console.log("movie");

      await axios_config
        .get("watch/" + item?.episodeId + "?id=" + item?.id)
        .then((res) => {
          setWatchData(res.data);
          setPlayer({
            image: item?.cover,
            video: res.data?.sources[0].url,
            quality: res.data?.sources[0].quality,
            episode_number: "No Episode",
          });
        })
        .catch((e) => {
          if (e?.message != "Network Error") {
            setError(1);
          } else {
            setError(2);
          }
          console.log(e);
        });
    } else {
      // first load
      if (item?.genres) {
        console.log("gana");

        setSelectedSeason(item?.seasons[0].season);
        console.log(
          "watch/" + item?.seasons[0].episodes[0]?.id + "?id=" + item?.id
        );
        await axios_config
          .get("watch/" + item?.seasons[0].episodes[0]?.id + "?id=" + item?.id)
          .then((res) => {
            setWatchData(res.data);
            setPlayer({
              ...player,
              image: item?.seasons[0].episodes[0]?.img?.mobile,
              video: res.data?.sources[0].url,
              quality: res.data?.sources[0].quality,
              episode_number:
                "Episode " + item?.seasons[0].episodes[0]?.episode,
            });
          })
          .catch((e) => {
            if (e?.message != "Network Error") {
              setError(1);
            } else {
              setError(2);
            }
            console.log(e);
          });
      } else {
        console.log("watch/" + item?.id + "?id=" + movieInfo?.id);
        await axios_config
          .get("watch/" + item?.id + "?id=" + movieInfo?.id)
          .then((res) => {
            setWatchData(res.data);
            setPlayer({
              ...player,
              image: item?.img?.mobile,
              video: res.data?.sources[0].url,
              quality: res.data?.sources[0].quality,
              episode_number: "Episode " + item?.episode,
            });
          })
          .catch((e) => {
            if (e?.message != "Network Error") {
              setError(1);
            } else {
              setError(2);
            }
            console.log(e);
          });
      }
    }
  };

  useEffect(() => {
    const data = props.route.params?.item;
    load();
  }, []);
  const WatchHeader = () => {
    return (
      <View style={{ backgroundColor: colors.black }}>
        <View
          style={{
            paddingTop: 60,
          }}
        />
        {player.video == null && player.image == null ? (
          <View
            style={{
              width,
              aspectRatio: 16 / 9,
              backgroundColor: colors.black,
            }}
          />
        ) : (
          // <></>
          <WebView
            scrollEnabled={false}
            style={{ width, aspectRatio: 16 / 9 }}
            source={{
              uri: `https://marvskiee.github.io/my_player/?video_source=${player?.video}&poster_source=${player?.image}`,
              headers: {
                "User-Agent":
                  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/517.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/517.36",
              },
            }}
            allowsFullscreenVideo={true}
          />
        )}
        <View style={{ paddingHorizontal: 10 }}>
          <View
            style={{
              flex: 1,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Text style={styles.label}>
              {player?.episode_number != null
                ? `${player?.episode_number}`
                : "Now Loading..."}
            </Text>

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
        </View>
        <Text style={[styles.label, { paddingHorizontal: 10 }]}>Quality</Text>

        <ScrollView horizontal={true}>
          <View
            style={{
              padding: 10,
              flexDirection: "row",
              gap: 10,
            }}
          >
            {watchData?.sources?.length > 0 ? (
              watchData?.sources?.map((item, key) => (
                <TouchableOpacity
                  activeOpacity={0.7}
                  key={key}
                  onPress={() =>
                    setPlayer({
                      ...player,
                      video: item?.url,
                      quality: item?.quality,
                    })
                  }
                >
                  <Text
                    style={[
                      styles.quality_text,
                      {
                        fontSize: 15,
                      },
                      ...[
                        item?.quality == player?.quality && {
                          backgroundColor: colors.primary,
                        },
                      ],
                    ]}
                  >
                    {item?.quality}
                  </Text>
                </TouchableOpacity>
              ))
            ) : (
              <Text style={styles.label}>Now Loading...</Text>
            )}
          </View>
        </ScrollView>
        {movieInfo?.seasons && (
          <Text style={[styles.label, { paddingHorizontal: 10 }]}>Seasons</Text>
        )}
        <ScrollView horizontal={true}>
          {movieInfo?.seasons?.length > 0 && (
            <View
              style={{
                padding: 10,
                flexDirection: "row",
                gap: 10,
              }}
            >
              {movieInfo?.seasons?.length > 0 ? (
                movieInfo?.seasons?.map((item, key) => (
                  <TouchableOpacity
                    activeOpacity={0.7}
                    key={key}
                    onPress={() => setSelectedSeason(item?.season)}
                  >
                    <Text
                      style={[
                        styles.quality_text,
                        {
                          fontSize: 15,
                        },
                        ...[
                          item?.season == selectedSeason && {
                            backgroundColor: colors.primary,
                          },
                        ],
                      ]}
                    >
                      Season {item?.season}
                    </Text>
                  </TouchableOpacity>
                ))
              ) : (
                <Text style={styles.label}>Now Loading...</Text>
              )}
            </View>
          )}
        </ScrollView>
        {movieInfo?.seasons && (
          <Text style={[styles.label, { paddingHorizontal: 10 }]}>
            Other Episode's
          </Text>
        )}
      </View>
    );
  };
  const EpisodeCard = ({ item }) => {
    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => watchHandler(item, true)}
      >
        <View style={{ flexDirection: "row", gap: 10, padding: 10 }}>
          <Image
            style={styles.episode_image}
            source={{ uri: item?.img?.mobile }}
          />
          <View style={{}}>
            <Text style={styles.episode_number}>Episode {item?.episode}</Text>
            <Text
              numberOfLines={3}
              style={[styles.episode_title, { width: (width - 20) * 0.6 }]}
            >
              {item?.title}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar />
      {/* {isLoading && <Modal />} */}
      {movieInfo ? (
        <>
          <View
            style={styles.header}
            x={10}
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
            <View style={{ gap: 10, flexDirection: "row" }}>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => {
                  ToastAndroid.show(
                    "This feature will implemented soon.",
                    ToastAndroid.SHORT
                  );
                }}
              >
                <View style={styles.navigation}>
                  <CastSvg />
                </View>
              </TouchableOpacity>
            </View>
          </View>
          <FlatList
            maxToRenderPerBatch={5}
            // initialNumToRender={5}
            stickyHeaderIndices={[0]}
            overScrollMode="never"
            keyExtractor={(item) => item?.id}
            nestedScrollEnabled={true}
            data={
              movieInfo?.seasons?.filter((i) => i?.season == selectedSeason)[0]
                ?.episodes
            }
            ListHeaderComponent={<WatchHeader />}
            renderItem={({ item }) => <EpisodeCard item={item} />}
          />
        </>
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
    tempInfo: state.watch.temp_info,
  };
};

export default connect(mapStateToProps, {})(Watch);

const styles = StyleSheet.create({
  ...common_styles({ width, height }),
  episode_image: {
    borderRadius: 10,
    width: width * 0.4,
    height: width * 0.25,
    resizeMode: "cover",
  },
  episode_number: {
    paddingVertical: 5,
    fontFamily: "smooch_extrabold",
    color: colors.white,
    borderRadius: 30,
    fontSize: 30,
    padding: 10,
  },
  episode_title: {
    fontFamily: "montserrat_bold",
    color: colors.white,
    opacity: 0.85,
    borderRadius: 30,
    padding: 10,
  },
  quality_text: {
    fontFamily: "montserrat_bold",
    color: colors.white,
    textAlign: "center",
    padding: 10,
    fontSize: 15,
    textTransform: "capitalize",
    borderRadius: 10,
    backgroundColor: colors.lightgray,
  },
  backgroundVideo: {
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  },
});
