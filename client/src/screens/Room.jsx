import { React, useCallback, useEffect, useState } from "react";
import ReactPlayer from "react-player";
import peer from "../service/peer";
import { useSocket } from "../context/SocketProvider";
import Navbar from "./Navbar";
import { Button } from "@mui/material";
// import styles from "./Room.css";

function RoomPage({ room }) {
  const socket = useSocket();
  const [remoteSocketId, setRemoteSocketId] = useState(null);
  const [myStream, setMyStream] = useState();
  const [remoteStream, setRemoteStream] = useState();
  // const [tracksAdded, setTracksAdded] = useState(false);

  const hanleUserJoined = useCallback(({ email, id }) => {
    console.log(`Email ${email} joined room`);
    setRemoteSocketId(id);
  }, []);

  const handleCallUser = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });

    //Sending our offer to another user
    const offer = await peer.getOffer();
    socket.emit("user:call", { to: remoteSocketId, offer });
    setMyStream(stream); //This stream can be rendered using 'ReactPlayer'
  }, [remoteSocketId, socket]);

  //Forming ans
  //useCallback's parameter will include what all we are sending
  //   console.log("There**********************");
  const handleIncomingCall = useCallback(
    async ({ from, offer }) => {
      setRemoteSocketId(from); // Call requested from user

      //Starting other user stream before creating ans
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });
      setMyStream(stream);

      console.log(`Incoming call`, from, offer);
      const ans = await peer.getAnswer(offer);
      //   console.log("************Ans: ", ans);
      socket.emit("call:accepted", { to: from, ans });
    },
    [socket]
  );

  const sendStreams = useCallback(() => {
    console.log("My stream: ", myStream);
    for (const track of myStream.getTracks()) {
      peer.peer.addTrack(track, myStream);
      // console.log(track);
    }
  }, [myStream]);

  const handleCallAccepted = useCallback(
    ({ from, ans }) => {
      peer.setLocalDescription(ans);
      console.log("Call Accepted!");
      // sending server tracks to user who accepted the call
      sendStreams();
    },
    [sendStreams]
  );

  const handleNegoNeeded = useCallback(async () => {
    const offer = await peer.getOffer();
    socket.emit("peer:nego:needed", { offer, to: remoteSocketId });
  }, [remoteSocketId, socket]);

  useEffect(() => {
    peer.peer.addEventListener("negotiationneeded", handleNegoNeeded);
    return () => {
      peer.peer.removeEventListener("negotiationneeded", handleNegoNeeded);
    };
  }, [handleNegoNeeded]);

  const handleNegoNeedIncoming = useCallback(
    async ({ from, offer }) => {
      const ans = await peer.getAnswer(offer);
      socket.emit("peer:nego:done", { to: from, ans });
    },
    [socket]
  );

  const handleNegoNeedFinal = useCallback(async ({ ans }) => {
    // console.log("****************Ans: ", ans);
    await peer.setLocalDescription(ans);
  }, []);

  useEffect(() => {
    peer.peer.addEventListener("track", async (ev) => {
      const remoteStream = ev.streams;
      console.log("Got Tracks!!");
      console.log(remoteStream);
      // console.log(remoteStream[0]);
      setRemoteStream(remoteStream[0]);
    });
  }, []);

  useEffect(() => {
    socket.on("user:joined", hanleUserJoined);
    //Handling incoming call
    socket.on("incoming:call", handleIncomingCall);
    //Handling acepted call
    socket.on("call:accepted", handleCallAccepted);
    //Work of another user on inciming tracks
    socket.on("peer:nego:needed", handleNegoNeedIncoming);
    //Handling negotiation final
    socket.on("peer:nego:final", handleNegoNeedFinal);

    return () => {
      socket.off("user:joined", hanleUserJoined);
      socket.off("incoming:call", handleIncomingCall);
      socket.off("call:accepted", handleCallAccepted);
      socket.off("peer:nego:needed", handleNegoNeedIncoming);
      socket.off("peer:nego:final", handleNegoNeedFinal);
    };
  }, [
    socket,
    hanleUserJoined,
    handleIncomingCall,
    handleCallAccepted,
    handleNegoNeedIncoming,
    handleNegoNeedFinal,
  ]);

  return (
    <div>
      <Navbar />
      <h1>Room Page</h1>
      <p>
        Your room id: <strong>{room}</strong> <br />
        (Share this with your squad)
      </p>
      <h4>{remoteSocketId ? "Connected" : "No one in room."}</h4>

      {remoteSocketId && (
        <Button variant="contained" onClick={handleCallUser}>
          Call
        </Button>
      )}
      {myStream && (
        <Button
          variant="contained"
          onClick={handleCallUser}
          style={{ margin: 5 }}
        >
          Share Stream
        </Button>
      )}

      {myStream && (
        <div className="stream">
          <h3 style={{ marginTop: 17, marginBottom: -8, marginLeft: -20 }}>
            My Stream...
          </h3>
          <ReactPlayer
            playing
            muted
            height="800px"
            width="800px"
            // url={myStream}
            url={myStream}
          />
        </div>
      )}

      {remoteStream && (
        <>
          <h3>Remote Stream</h3>
          <ReactPlayer
            playing
            muted
            height="800px"
            width="800px"
            // url={remoteStream}
            url={remoteStream}
            playsInline={true}
          />
        </>
      )}
    </div>
    // </div>
  );
}

export default RoomPage;
