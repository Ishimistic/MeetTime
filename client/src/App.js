import {Routes, Route} from 'react-router-dom'
import { useState } from 'react';
import './App.css';
import Lobby from './screens/Lobby';
import RoomPage from './screens/Room';

function App() {
  const [room, setRoom] = useState("");
  return (
    <div className="App">
      <Routes>
        <Route path='/' element={<Lobby room={room} setRoom={setRoom}/>}/>
        <Route path='/room/:roomId' element={<RoomPage room={room}/>}/>
        {/* /: means dynamic id */}
      </Routes>
    </div>
  );
}

export default App;
