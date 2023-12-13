import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
//import StarRating from "./StarRating";
//import App_version1 from "./App_version1";

/*function Test() {
  const [movieRating, setMovieRating] = useState(0);

  function handleMovieRating(value) {
    setMovieRating(value);
  }

  return (
    <div>
      <StarRating handleMovieRating={handleMovieRating} />
      <p>This movie is rated at {movieRating} stars</p>
    </div>
  );
}*/

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
    {/* <StarRating message={["Terrible", "Bad", "Okay", "Good", "Amazing"]} />
    <Test /> */}
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
