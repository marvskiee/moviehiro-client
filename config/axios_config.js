import axios from "axios";

export default axios.create({
  baseURL: "https://api.consumet.org/meta/tmdb/",
});
