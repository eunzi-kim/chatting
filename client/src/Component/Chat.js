import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import io from 'socket.io-client';
import $ from "jquery";

import './css/Chat.css';

const chat = io.connect('http://10.10.1.83:5000/chat', { transport: ['websocket']});

function Chat() {
  // const url = "http://10.10.1.83:5000/api";
  // const chat = io.connect('http://10.10.1.83:5000', { transport: ['websocket']});

  const props = useParams();
  const room_id = props['roomid']
  const userinfo = JSON.parse(localStorage.getItem("userinfo"));
  const [ roomData, setRoomData ] = useState({'room_id': ''});
  const [ chatData, setChatData ] = useState([]);
  const [ message, setMessage ] = useState("");  
  const [ clickPlus, setClickPlus ] = useState(false);
  const [ clickInfo, setClickInfo ] = useState(false);
  const [ friendname, setFriendname ] = useState("");

  useEffect(() => {
    chat.emit('enter', {'user_id': userinfo.id, 'room': room_id})
  }, []);

  useEffect(() => {
    chat.on('enter res', res => {
      if (res === 'no') {
        alert("대화방의 멤버가 아닙니다.")
        window.location.replace('/')
      } else {
        setRoomData(res['room'])
        setChatData(res['content'])
      }
    })
  }, [])

  useEffect(() => {
    chat.on('response', (msg) => {
      setChatData(data => [...data, msg])
    })
  }, []);

  const onChangeMsg = (e) => {
    setMessage(e.target.value)
  };

  const onSendMsg = () => {
    let date = new Date()
    if (message.length) {
      let temp = {"content": message, "writer": userinfo.id, "username": userinfo.username, "time": String(date), "room": roomData.room_id}
      chat.emit('my event', temp)
      setMessage("")
    } else {
      alert("메세지를 입력해주세요.")
    }    
  };

  const searchFriend = () => {   
    chat.emit('search friend', {"friend": friendname, "room_id": roomData.room_id})
    chat.on('find', msg => {
      if (msg === "exist") {
        alert("이미 채팅방에 존재합니다.")
      } else if (msg === "no") {
        alert("유저가 존재하지 않습니다.")
      } else if (msg === "yes") {
        alert("초대되었습니다.")
      }
      setClickPlus(false)
    })
    chat.on('plus member', res => {
      setRoomData(res)
    })
  };

  const onExit = () => {
    chat.emit('exit', {'user': userinfo['username'], 'room': room_id})
    chat.on("go away", res => {
      console.log(res)
      if (res === 'success') {
        alert('채팅방을 나갔습니다.')
        window.location.replace('/')
      }
    })
  };

  $(document).ready(function () {
    if ($(".chat-body").length) {
      var scroll_h = $(".chat-body")[0].scrollHeight;
      $(".chat-body").scrollTop(scroll_h);
    }
  });

  const onKey = (e) => {
    if (e.keyCode === 13) {
      onSendMsg()
    }
  }

  return (
    <div className="right">
      <div className='chat-header'>
        <div className='chat-title'>
          <h2>채팅방{ roomData.room_id }</h2>
          { roomData.member_num > 2 ? <span>{ roomData.member_num }</span> : <></> }
        </div>
        <div className='chat-btns'>
          <h2 className='chat-ip' onClick={() => setClickInfo(!clickInfo)} >ⓘ</h2>
          <h2 className='chat-ip' onClick={() => setClickPlus(!clickPlus)}>➕</h2>
        </div>
      </div>
      <div className='chat-body'>
        { chatData.map((item, idx) => 
          <div key={idx}>     
            { item.writer === userinfo.username ?
              <div className='chatting me-chatting'>
                <div className='chat-writer me-writer'>{item.writer}</div>
                <div className='chat-content me-content'>{item.content}</div>
              </div> :
              <div className='chatting'>
                <div className='chat-writer'>{item.writer}</div>
                <div className='chat-content'>{item.content}</div>
              </div>              
            }      
          </div>
        )}
      </div>
      <div className='chat-bottom'>
        <div className='chat-write'>
          <textarea placeholder='메세지 작성' onChange={onChangeMsg} value={message} onKeyUp={onKey} />
          <button className='chat-btn' onClick={onSendMsg}>Send</button>
        </div>
      </div>
      { clickPlus ? 
        <div className='plus-member'>
          <div><h3>채팅초대</h3></div>
          <input id="pm-input" onChange={(e) => setFriendname(e.target.value)} placeholder="닉네임을 모두 입력해주세요." />
          <button id="pm-btn" onClick={searchFriend}>추가하기</button>
        </div> :
        <></>
      }
      { clickInfo ? 
        <div className='info-member'>
          <div><h3>채팅방 멤버</h3></div>
          { roomData.member.map((item, idx) => 
            <div key={idx} id="member">
              <div>{item}</div>              
            </div>
          ) }
          <Link to='/'>
            <button>메인화면</button>
          </Link>          
          <button onClick={onExit}>채팅방 나가기</button>          
        </div> :
        <></>
      }
    </div>
  )
};

export default Chat;