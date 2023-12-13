import { useEffect, useRef, useState } from "react";
import "./index.css";
import StarRating from "./StarRating";

const tempMovieData = [
  {
    imdbID: "tt1375666",
    Title: "Inception",
    Year: "2010",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg",
  },
  {
    imdbID: "tt0133093",
    Title: "The Matrix",
    Year: "1999",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BNzQzOTk3OTAtNDQ0Zi00ZTVkLWI0MTEtMDllZjNkYzNjNTc4L2ltYWdlXkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_SX300.jpg",
  },
  {
    imdbID: "tt6751668",
    Title: "Parasite",
    Year: "2019",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BYWZjMjk3ZTItODQ2ZC00NTY5LWE0ZDYtZTI3MjcwN2Q5NTVkXkEyXkFqcGdeQXVyODk4OTc3MTY@._V1_SX300.jpg",
  },
];

const tempWatchedData = [
  {
    imdbID: "tt1375666",
    Title: "Inception",
    Year: "2010",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg",
    runtime: 148,
    imdbRating: 8.8,
    userRating: 10,
  },
  {
    imdbID: "tt0088763",
    Title: "Back to the Future",
    Year: "1985",
    Poster:
      "https://m.media-amazon.com/images/M/MV5BZmU0M2Y1OGUtZjIxNi00ZjBkLTg1MjgtOWIyNThiZWIwYjRiXkEyXkFqcGdeQXVyMTQxNzMzNDI@._V1_SX300.jpg",
    runtime: 116,
    imdbRating: 8.5,
    userRating: 9,
  },
];

const average = (arr) =>
  arr.reduce((acc, cur, i, arr) => acc + cur / arr.length, 0);

const apiKey = "b03680d";

export default function App() {
  const [movies, setMovies] = useState([]);
  const [watched, setWatched] = useState(() => {
    const storedValue = localStorage.getItem("watched");
    return JSON.parse(storedValue);
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(null);

  function handleQueryState(value) {
    setQuery(value);
  }

  function handleSelectedId(id) {
    if (selectedId !== id) {
      setSelectedId(id);
    } else {
      setSelectedId(null);
    }
  }

  function handleBackButton() {
    setSelectedId(null);
  }

  function addWatchedMovie(newMovie) {
    setWatched((watched) => [...watched, newMovie]);
    // localStorage.setItem("watched", JSON.stringify([...watched, newMovie]));
  }

  function deleteMovie(id) {
    setWatched((watched) => watched.filter((movie) => movie.imdbID !== id));
  }

  useEffect(() => {
    const controller = new AbortController();
    async function fetchMovies() {
      try {
        setIsLoading(true);
        setError("");
        const res = await fetch(
          "http://www.omdbapi.com/?apikey=" + apiKey + "&s=" + query,
          { signal: controller.signal }
        );
        if (!res.ok) {
          throw new Error("Something went wrong with fetching the movies...");
        }
        const data = await res.json();
        if (data.Response === "False") {
          throw new Error("Not Found");
        }
        handleBackButton();
        setMovies(data.Search);
        setError("");
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message);
        }
      } finally {
        setIsLoading(false);
      }
    }

    if (query.length < 3) {
      setMovies([]);
      setError("");
      return;
    }

    fetchMovies();
    return () => controller.abort();
  }, [query]);

  useEffect(() => {
    localStorage.setItem("watched", JSON.stringify(watched));
  }, [watched]);

  return (
    <>
      <NavBar>
        <SearchBar query={query} handleQueryState={handleQueryState} />
        <NumItems movies={movies} />
      </NavBar>
      <Main>
        <Box>
          {/*{isLoading ? <Loading /> : <MovieList movies={movies} />}*/}
          {isLoading ? (
            <Loading />
          ) : error ? (
            <Error message={error} />
          ) : (
            <MovieList movies={movies} handleSelectedId={handleSelectedId} />
          )}
        </Box>
        <Box>
          {selectedId ? (
            <MovieDetails
              selectedId={selectedId}
              handleBackButton={handleBackButton}
              addWatchedMovie={addWatchedMovie}
              watched={watched}
            />
          ) : (
            <>
              <Summary watched={watched} />
              <WatchedList watched={watched} deleteMovie={deleteMovie} />
            </>
          )}
        </Box>
      </Main>
    </>
  );
}

function NavBar({ children }) {
  return (
    <nav className="nav-bar">
      <Logo />
      {children}
    </nav>
  );
}

function Logo() {
  return (
    <div className="logo">
      <span role="img">🍿</span>
      <h1>usePopcorn</h1>
    </div>
  );
}

function SearchBar({ query, handleQueryState }) {
  const inputEl = useRef(null);

  function setUpQuery(value) {
    handleQueryState(value);
  }

  useEffect(() => {
    //console.log(inputEl.current);

    function callback(e) {
      if (document.activeElement === inputEl.current) {
        return;
      }

      if (e.code === "Enter") {
        inputEl.current.focus();
        handleQueryState("");
      }
    }

    /*   inputEl.current.focus(); - search bar will auto focus in the mount */

    document.addEventListener("keydown", callback);

    return () => {
      document.removeEventListener("keydown", callback);
    };
  }, [handleQueryState]);

  return (
    <input
      className="search"
      type="text"
      placeholder="Search movies..."
      value={query}
      onChange={(e) => setUpQuery(e.target.value)}
      ref={inputEl}
    />
  );
}

function Error({ message }) {
  return (
    <div className="error">
      <p>{message}</p>
    </div>
  );
}

function NumItems({ movies }) {
  return (
    <p className="num-results">
      Found <strong>{movies.length}</strong> results
    </p>
  );
}

function Main({ children }) {
  return <main className="main">{children}</main>;
}

function Box({ children }) {
  const [isOpen, setIsOpen] = useState(true);
  return (
    <div className="box">
      <button className="btn-toggle" onClick={() => setIsOpen((open) => !open)}>
        {isOpen ? "–" : "+"}
      </button>
      {isOpen && children}
    </div>
  );
}

function Loading() {
  return (
    <div className="loader">
      <p>Loading...</p>
    </div>
  );
}

function MovieDetails({
  selectedId,
  handleBackButton,
  addWatchedMovie,
  watched,
}) {
  const [movie, setMovie] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [usersRating, setUsersRating] = useState("");
  const [isalreadyAdded, setIsAlreadyAdded] = useState(false);
  const [currentRating, setCurrentRating] = useState(0);

  const {
    Title,
    Year,
    Runtime,
    Poster,
    imdbRating,
    Plot,
    Released,
    Actors,
    Director,
    Genre,
  } = movie;

  function setUpBackButton() {
    handleBackButton();
  }

  function addNewWatchedMovie() {
    const newMovie = {
      imdbID: selectedId,
      title: Title,
      year: Year,
      runtime: Number(Runtime.split(" ").at(0)),
      poster: Poster,
      imdbRating,
      userRating: Number(usersRating),
    };
    addWatchedMovie(newMovie);
    handleBackButton();
  }

  function handleWatchedRating(value) {
    setUsersRating(value);
  }

  useEffect(() => {
    const controller = new AbortController();

    async function getMovies() {
      try {
        setIsAlreadyAdded(false);
        setIsLoading(true);
        setError("");
        const res = await fetch(
          "http://www.omdbapi.com/?apikey=" + apiKey + "&i=" + selectedId,
          { signal: controller.signal }
        );
        if (!res.ok) {
          throw new Error(
            "Something went wrong with fetching the movie details..."
          );
        }
        const data = await res.json();
        if (data.Response === "False") {
          throw new Error("Not Found");
        }
        setMovie(data);
        setError("");
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message);
        }
      } finally {
        setIsLoading(false);
      }

      if (watched.length > 0) {
        watched.map((movie) => {
          if (movie.imdbID === selectedId) {
            setIsAlreadyAdded((isalreadyAdded) => true);
            setCurrentRating(movie.userRating);
          }
        });
      }
    }
    getMovies();

    return () => {
      controller.abort();
    };
  }, [selectedId, watched]);

  useEffect(() => {
    if (!Title) {
      return;
    }
    document.title = Title;
    return () => (document.title = "usePopcorn");
  }, [Title]);

  useEffect(() => {
    function callback(e) {
      if (e.code === "Escape") {
        handleBackButton();
      }
    }
    document.addEventListener("keydown", callback);

    return () => document.removeEventListener("keydown", callback);
  }, [handleBackButton]);

  return (
    <div className="details">
      {isLoading ? (
        <Loading />
      ) : (
        <>
          <header>
            <button className="btn-back" onClick={setUpBackButton}>
              ⬅
            </button>
            <img src={Poster} alt={`Poster of ${Title}`} />
            <div className="details-overview">
              <h2>{Title}</h2>
              <p>
                {Released} {"  .  "} {Runtime}
              </p>
              <p>{Genre}</p>
              <p>
                <span>⭐</span> {imdbRating} IMDb Rating
              </p>
            </div>
          </header>

          <section>
            {isalreadyAdded ? (
              <h4 style={{ color: "green" }}>
                The movie is already in the watched list. Your current rating is{" "}
                {currentRating} ⭐
              </h4>
            ) : (
              <div className="rating">
                <StarRating
                  maxValue="10"
                  maxSize="24"
                  handleMovieRating={handleWatchedRating}
                />
                {usersRating ? (
                  <button className="btn-add" onClick={addNewWatchedMovie}>
                    + Add to watched list
                  </button>
                ) : null}
              </div>
            )}

            <p>
              <em>{Plot}</em>
            </p>
            <p>Starring : {Actors}</p>
            <p>Directed by : {Director}</p>
          </section>
        </>
      )}
    </div>
  );
}

function MovieList({ movies, handleSelectedId }) {
  return (
    <ul className="list list-movies">
      {movies?.map((movie) => (
        <Movie
          movie={movie}
          handleSelectedId={handleSelectedId}
          key={movie.imdbID}
        />
      ))}
    </ul>
  );
}

function Movie({ movie, handleSelectedId }) {
  return (
    <li onClick={() => handleSelectedId(movie.imdbID)}>
      <img src={movie.Poster} alt={`${movie.Title} poster`} />
      <h3>{movie.Title}</h3>
      <div>
        <p>
          <span>🗓</span>
          <span>{movie.Year}</span>
        </p>
      </div>
    </li>
  );
}

function Summary({ watched }) {
  const avgImdbRating = average(watched.map((movie) => movie.imdbRating));
  const avgUserRating = average(watched.map((movie) => movie.userRating));
  const avgRuntime = average(watched.map((movie) => movie.runtime));
  return (
    <div className="summary">
      <h2>Movies you watched</h2>
      <div>
        <p>
          <span>#️⃣</span>
          <span>{watched.length} movies</span>
        </p>
        <p>
          <span>⭐️</span>
          <span>{avgImdbRating.toFixed(2)}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{avgUserRating.toFixed(2)}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{avgRuntime.toFixed(2)} min</span>
        </p>
      </div>
    </div>
  );
}

function WatchedList({ watched, deleteMovie }) {
  return (
    <ul className="list">
      {watched.map((movie) => (
        <WatchedMovie
          movie={movie}
          deleteMovie={deleteMovie}
          key={movie.imdbID}
        />
      ))}
    </ul>
  );
}

function WatchedMovie({ movie, deleteMovie }) {
  function handleMovieDelete() {
    deleteMovie(movie.imdbID);
  }
  return (
    <li>
      <img src={movie.poster} alt={`${movie.title} poster`} />
      <h3>{movie.title}</h3>
      <div>
        <p>
          <span>⭐️</span>
          <span>{movie.imdbRating}</span>
        </p>
        <p>
          <span>🌟</span>
          <span>{movie.userRating}</span>
        </p>
        <p>
          <span>⏳</span>
          <span>{movie.runtime} min</span>
        </p>
        <button className="btn-delete" onClick={handleMovieDelete}>
          ❌
        </button>
      </div>
    </li>
  );
}
