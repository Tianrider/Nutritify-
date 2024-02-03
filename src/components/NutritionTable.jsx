import Song from "./Song";
import { useEffect, useState } from "react";

const NutritionTable = (props) => {
  const clientID = "b1a2a9d825c54f6698004b762712075b";
  const clientSecret = "0fb53aec7f00405099eb58199050a974";
  const redirect_uri = "http://localhost:5173/Home";
  const [recentlyPlayedData, setRecentlyPlayedData] = useState([]);
  const [totalMinutes, setTotalMinutes] = useState(0);
  const [token, setToken] = useState(null);

  useEffect(() => {
    handleRedirect();
  }, []);

  useEffect(() => {
    getTracks();
  }, [token, props.amount]);

  const handleRedirect = async () => {
    console.log("Handling redirect");
    let code = getCode();
    if (code) {
      console.log(code);
      await getToken(code);
    }
  };

  function getCode() {
    let code = null;
    const queryString = window.location.search;
    if (queryString.length > 0) {
      const urlParams = new URLSearchParams(queryString);
      code = urlParams.get("code");
    }
    return code;
  }

  const getToken = async (code) => {
    console.log("Getting token");
    const result = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "content-type": "application/x-www-form-urlencoded",
        Authorization: "Basic " + btoa(clientID + ":" + clientSecret),
      },
      body:
        "grant_type=authorization_code" +
        "&code=" +
        code +
        "&redirect_uri=" +
        encodeURIComponent(redirect_uri) +
        "&client_id=" +
        clientID +
        "&client_secret=" +
        clientSecret,
    });

    const data = await result.json();
    console.log(data);
    setToken(data.access_token);
  };

  const getTracks = async () => {
    console.log(token);
    const result = await fetch(
      `https://api.spotify.com/v1/me/player/recently-played?limit=${props.amount}`,
      {
        method: "GET",
        headers: { Authorization: "Bearer " + token },
      }
    );

    const data = await result.json();
    setRecentlyPlayedData(data.items);

    const totalDuration = data.items.reduce((acc, song) => {
      return acc + Math.floor(song.track.duration_ms / 60000);
    }, 0);

    setTotalMinutes(totalDuration);
  };

  return (
    <div id="nutritionTable" style={{ padding: 0 }}>
      <section className="nutrition-facts">
        <header>
          <h1>Nutritify Facts</h1>
          <p>8 servings per container</p>
          <p>
            <strong>
              Serving size <span>2/3 cup (55g)</span>
            </strong>
          </p>
        </header>

        <table className="main-nutrients">
          <thead>
            <tr>
              <th colSpan="2">
                Amount per serving <br />
                <strong>Minutes</strong>
                <span id="totalDuration">{totalMinutes}</span>
              </th>
            </tr>
          </thead>

          <tbody id="recentlyPlayedContainer">
            <tr className="daily-value">
              <th colSpan="2">
                <strong>DME*</strong>
              </th>
            </tr>
            {recentlyPlayedData?.map((song) => {
              const durationMs = song.track.duration_ms;
              const durationMinutes = Math.floor(durationMs / 60000);
              const durationSeconds = (
                "0" + ((durationMs % 60000) / 1000).toFixed(0)
              ).slice(-2);
              const formattedDuration = `${durationMinutes}:${durationSeconds}`;

              return (
                <Song
                  key={song.track.id}
                  title={song.track.name}
                  artist={song.track.artists[0].name}
                  duration={formattedDuration}
                />
              );
            })}
          </tbody>
        </table>
        <table className="additional-nutrients">
          <tbody>
            <tr></tr>
          </tbody>
        </table>

        <p className="footnote">
          The Daily Music Experience (DME) indicates how much each song in your
          recently played list contributes to your daily listening journey. 60
          minutes a day is recommended for general nutrition advice.
        </p>
        <p></p>
      </section>
    </div>
  );
};

export default NutritionTable;