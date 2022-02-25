import { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import "./css/Sign.css";

function Login() {
  const url = "http://10.10.1.83:5000/api"
  const [ username, setUsername ] = useState("");
  const [ password, setPassword ] = useState("");

  const onChangeUsername = (e) => {
    setUsername(e.target.value)
  }

  const onChangePassword = (e) => {
    setPassword(e.target.value)
  }

  const fetchLogin = async(data) => {
    await axios.post(url+"/login", data)
    .then(res => {
      if (res.data.message === "success") {
        localStorage.setItem("userinfo", JSON.stringify(res.data.data))
        window.location.replace('/')
      }
      else {
        alert(res.data.errmsg)
      }
    })
  }

  const onLogin = () => {
    let data = {
      "username": username,
      "password": password
    }
    fetchLogin(data)
  }

  return (
    <div className="sign">
      <h1 className="title">Login</h1>
      <div>
        <div className="s-inputgroup">
          <span className="s-inputlabel">닉네임</span>
          <input className="s-input" onChange={onChangeUsername} />
        </div>
        <div className="s-inputgroup">
          <span className="s-inputlabel">비밀번호</span>
          <input type="password" className="s-input" onChange={onChangePassword} />
        </div>
      </div>
      { username && password ?
        <button className="s-btn" onClick={onLogin}>Login</button> :
        <div className="s-btnno">Login</div>
      }
      <Link to='/signup'>
        <div id="go-signup">계정을 만들고 싶어요.</div>
      </Link>      
    </div>
  )
};

export default Login;