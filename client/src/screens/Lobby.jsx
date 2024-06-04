import { React, useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSocket } from "../context/SocketProvider";
import { TextField, Button } from "@mui/material";
import styles from "./Lobby.css";
import Navbar from "./Navbar";
// import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';

function generateRandomRoomID() {
  return Math.random().toString(36).substr(2, 9);
}

function Lobby({ room, setRoom }) {
  const [email, setEmail] = useState("");
  // const [room, setRoom] = useState("");

  const socket = useSocket();
  const navigate = useNavigate();

  const handleGetRoom = () => {
    const newRoomID = generateRandomRoomID();
    setRoom(newRoomID);
    if (!email) return;
  };

  const handleSubmitForm = useCallback(
    (e) => {
      e.preventDefault();
      // console.log("Handle submit Form function: ", { email, room });
      socket.emit("room:join", { email, room });
    },
    [email, room, socket]
  );

  const handleJoinRoom = useCallback(
    (data) => {
      const { email, room } = data;
      if (!email || !room) return;
      console.log("Email and Room of user: ", email, room);
      navigate(`/room/${room}`);
    },
    [navigate]
  );

  useEffect(() => {
    socket.on("room:join", handleJoinRoom);
    return () => {
      //Our component re-render multiple times and we don't want to have them so we need to deregistered a register.
      socket.off("room:join", handleJoinRoom);
    };
  }, [socket, handleJoinRoom]);

  return (
    <div>
      <Navbar />
      {/* <h1 className="room">
        <p className="createRoomTag">It's your meet...</p>
      </h1> */}
      <div className="container">
        <h1>Lobby</h1>
        <br/>
        <form onSubmit={handleSubmitForm}>
          <label htmlFor="room" style={{ textAlign: "center" }}>
            Email Id:{" "}
          </label>
          <TextField
            variant="filled"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ margin: 1, marginLeft: 27.5, width: 200, height: 70 }}
          />
          <br />
          <label htmlFor="room"> Room Number</label>
          <TextField
            variant="filled"
            value={room}
            onChange={(e) => setRoom(e.target.value)}
            required
            style={{ marginLeft: 1.5, width: 200, height: 70 }}
          />

          <br />
          <Button variant="contained" type="submit">
            Join Room
          </Button>
          <Button
            variant="contained"
            onClick={handleGetRoom}
            style={{ margin: 4 }}
          >
            Get Room
          </Button>
        </form>
      </div>
    </div>
  );
}

export default Lobby;
