import React from "react";
import ReactDOM from "react-dom/client";
import EventsApp from "./EventsApp.jsx";
import "./events.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <EventsApp />
  </React.StrictMode>,
);
