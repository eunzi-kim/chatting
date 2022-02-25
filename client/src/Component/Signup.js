import { useState, useEffect } from "react";
import axios from 'axios';
import "./css/Sign.css";

function Signup() {
  const url = "http://10.10.1.83:5000/api"
  const [ username, setUsername ] = useState("");
  const [ password, setPassword ] = useState("");
  const [ passwordConfirm, setPasswordConfirm ] = useState("");
  const [ chkPassword, setChkPassword ] = useState(false);

  const onChangeUsername = (e) => {
    setUsername(e.target.value)
  }

  const onChangePassword = (e) => {
    setPassword(e.target.value)
  }

  const onChangePasswordConfirm = (e) => {
    setPasswordConfirm(e.target.value)
  }

  // 비밀번호와 비밀번호확인 동일 체크
  const onChkPassword = () => {
    if (password === passwordConfirm && password.length > 0) {
      setChkPassword(true)
    } else {
      setChkPassword(false)
    }
  }

  useEffect(() => {
    onChkPassword()
  })

  const fetchSignup = async(data) => {
    await axios.post(url+'/signup', data)
    .then(res => {
      if (res.data.message === "success") {
        alert("회원가입에 성공하였습니다.")
        window.location.replace('/login')
      } else {
        alert("동일한 닉네임이 존재합니다.")
      }
    })
    .catch(err => {
      console.log(err.response)
      alert("회원가입에 실패하였습니다.")
    })
  }

  const onSignup = () => {
    let data = {
      "username": username,
      "password": password
    }
    fetchSignup(data)
  }

  return (
    <div className="sign">
      <h1 className="title">Sign Up</h1>
      <div>
        <div className="s-inputgroup">
          <span className="s-inputlabel">닉네임</span>
          <input className="s-input" onChange={onChangeUsername} />
        </div>
        <div className="s-inputgroup">
          <span className="s-inputlabel">비밀번호</span>
          <input type="password" className="s-input" onChange={onChangePassword} />
        </div>
        <div className="s-inputgroup">
          <span className="s-inputlabel">비밀번호 확인</span>
          <input type="password" className="s-input" onChange={onChangePasswordConfirm} />
        </div>
      </div>
      { chkPassword && username ?
        <button className="s-btn" onClick={onSignup}>Sign Up</button> :
        <div className="s-btnno">Sign Up</div>
      }      
    </div>
  )
};

export default Signup;