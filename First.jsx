import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './First.css';
import robot1 from './assets/robot1.webp'; // 이미지 파일 가져오기

function First() {
  const [nickname, setNickname] = useState('');
  const navigate = useNavigate();

  const startChat = async () => {
    if (nickname.trim()) {
      try {
        const response = await fetch('http://localhost:5001/join', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nickname })
        });
        if (response.ok) {
          navigate(`/second?nickname=${encodeURIComponent(nickname)}`);
        } else {
          alert('닉네임을 입력해 주세요');
        }
      } catch (error) {
        console.error('Error:', error);
        alert('서버와 통신 중 문제가 발생했습니다.');
      }
    } else {
      alert('닉네임을 입력해 주세요');
    }
  };

  return (
    <div className="bg" style={{ backgroundImage: `url(${robot1})` }}>
      <div className="content">
        <h1>Welcome to Chatbot AI</h1>
        <input
          type="text"
          placeholder="닉네임을 입력해 주세요"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
        />
        <button onClick={startChat}>Friend 'F'</button>
      </div>
    </div>
  );
}

export default First;
