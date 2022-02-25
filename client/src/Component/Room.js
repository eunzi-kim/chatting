import { useEffect, useState } from 'react';
import axios from 'axios';
import io from 'socket.io-client';

import './css/Room.css';

function Room() {
  const socket = io.connect("http://10.10.1.83:5000", { transport: ['websocket']});
  const url = "http://10.10.1.83:5000/api";

  const userinfo = JSON.parse(localStorage.getItem("userinfo"));
  const [ rooms, setRooms ] = useState([]);

  useEffect(() => {
    fetchRooms()
  }, []);

  useEffect(() => {
    socket.emit('leave')
  }, []);

  const fetchRooms = async() => {
    await axios.get(url+`/rooms/${userinfo.id}`)
    .then(res => {
      console.log(res)
      setRooms(res.data)
    })
    .catch(err => {
      console.log(err.response)
    })
  };

  const onSelectRoom = (room_id) => {
    window.location.href = `/${room_id}`
  };

  const makeRoom = () => {
    socket.emit("make", {"username": userinfo.username, "user_id": userinfo.id})
    socket.on("make", res => {
      console.log(res)
      if (res === "ok") {
        alert("채팅방이 생성되었습니다.")
        fetchRooms()
      }
    })
    fetchRooms()
  }

  const onLogout = () => {
    localStorage.removeItem("userinfo");
    window.location.replace("/login")
  }

  const room = '/home.png';

  return (
    <div className="chat">
      <h1>나의 채팅방 💬</h1>
      <div className="rooms">
        { rooms.map((item, idx) => 
          <div key={idx}> 
            <div className='room room-chk' onClick={() => onSelectRoom(item.room_id)}>
              <div className='room-name'>
                <h3>채팅방{ item.room_id }</h3>
              </div>
              <div className='room-chatting'>
                <h4>{ item.member_num }명</h4>
              </div>
            </div> 
          </div>
        ) }
      </div>      
      <div className='make-room' onClick={makeRoom}>
        <img src={room} alt="room" title="방만들기" />
      </div>
      <button className='rooms-bottom' onClick={onLogout}>
        <h3>로그아웃</h3>
      </button>

      {/* <ChatLeft />
      <ChatRight />  */}
    </div>
  )
};

export default Room;