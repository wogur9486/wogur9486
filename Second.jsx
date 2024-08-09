import React, { useState, useEffect } from 'react'; // React 라이브러리와 useState, useEffect 를 불러옵니다.
import { useLocation } from 'react-router-dom'; // 현재 URL 위치정보를 가져올 때 사용합니다.
import './Second.css'; // Second.css 파일을 불러와 컴포넌트에 스타일을 적용
import botImage from './assets/ROBOT1.png'; // botImage 를 ./assets/ROBOT1.png 경로에서 가져온다.
import userImage from './assets/th.jpeg' // userImage 를 ./assets/th.jpeg 경로에서 가져온다. 

function Second() { // Second 라는 함수형 컴포넌트를 정의한다.
  const [messages, setMessages] = useState([]); // messages 라는 상태변수를 초기값으로 빈 배열을 가지고 있다.
  const [inputMessage, setInputMessage] = useState('');  // inputMessage 라는 상태 변수에 초기값으로 빈 문자열을 가지고 있다.
  const location = useLocation(); // 현재 URL의 위치 정보를 가져옴
  const userNickname = new URLSearchParams(location.search).get('nickname') || 'User'; // URL에서 nickname이라는 쿼리파라미터를 가져온다. 
                                                                                       // 만약에 nickname이 없으면 기본값으로 User를 사용

  const fetchMessages = async () => { // 서버에서 메시지를 비동기적으로 가져오는 함수이다.
    try {
      const response = await fetch('http://localhost:5001/messages'); // fetch 함수를 사용해 url 주소로 GET 요청을 보낸다.
      if (!response.ok) throw new Error('Error fetching messages'); // 응답이 성공적이지 않으면 에러를 발생

      const data = await response.json(); // 응답 본문을 JSON으로 변환한다.
      setMessages(data); // 가져온 메시지 데이터를 messages 상태로 설정.

    } catch (error) { // 오류가 발생하면 콘솔에 오류를 기록하고, 사용자에게 알림을 표시한다.
      console.error('Error:', error);
      alert('서버와 통신 중 문제가 발생했습니다.');
    }
  };

  const changeNickname = async () => { // 사용자 닉네임을 변경하는 비동기 함수이다.
    try {
      const response = await fetch('http://localhost:5001/change-nickname', { // fetch 함수를 이용해 url에 POST 요청을 보낸다.

        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nickname: userNickname })
      });

      if (response.ok) setMessages([]); // 응답이 성공하면, messages 상태를 빈 배열로 설정하여 메시지를 초기화한다.

    } catch (error) { // 오류가 발생하면 콘솔창에 오류를 기록하고, 사용자에게 알림을 표시한다.
      console.error('Error:', error);
      alert('서버와 통신 중 문제가 발생했습니다.');
    }
  };

  useEffect(() => { // 컴포넌트가 처음 렌더링 될 때, fetchMessages를 호출하고
    fetchMessages(); // 메시지를 초기 로드

    const interval = setInterval(fetchMessages, 1000); // 1초마다 메시지를 주기적으로 가져옴
                                      // setInterval(callbackFunction(주기적으로 실행할 함수),
                                      //             intervalTime(밀리초 단위로 지정된 시간 간격))
    return () =>
      clearInterval(interval); // 컴포넌트가 언마운트 될 때 인터벌을 클리어하여 메모리 누수 방지
  }, []); // 의존성 배열이 빈 배열 '[]' 로 지정되어 있으므로, useEffect 컴포넌트가 처음 렌더링될 때 한 번만 실행

  useEffect(() => { // userNickname 변경될 때마다 changeNickname 을 호출하여 닉네임을 서버에 업데이트 합니다.
    changeNickname();
  }, [userNickname]); 

  const formatTimestamp = (timestamp) => { // 타임스탬프를 사람이 읽기 쉬운 형식으로 변환
    const date = new Date(timestamp); // 타임스탬프를 Date 객체로 변환
    if (isNaN(date.getTime())) return 'Invalid date'; // 타임스탬프가 유효하지 않으면 Invalid date 반환
                                                      // data.getTime을 사용해 data가 유효한지 확인.
    return date.toLocaleString('ko-KR', {
      weekday: 'long',   //요일
      year: 'numeric',   //연도
      month: 'long',     //월
      day: 'numeric',    //일
      hour: '2-digit',   //시간
      minute: '2-digit', //분
      second: '2-digit'  //초
    });
  };

  const sendMessage = async () => { // 새 메시지를 서버에 전송하는 비동기 함수이다.
    if (!inputMessage.trim()) return; // 메시지가 공백이 있는 경우, 아무 작업도 하지 않고 함수를 종료한다.
    try {
      const response = await fetch('http://localhost:5001/send-message', { // fetch 함수를 통해 url에 POST 요청을 보낸다.
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }, // 요청 본문은 JSON 형식으로 사용자 닉네임과 메시지를 포함한다.
        body: JSON.stringify({
          sender: userNickname,
          text: inputMessage
        })
      });
      if (response.ok) { // 응답이 성공적이면 입력 필드를 초기화 하고 메시지를 다시 가져와서 새로운 메시지를 업데이트 합니다.
        setInputMessage(''); // 입력필드를 비웁니다.
        fetchMessages(); // 새로운 메시지를 반영하기 위해 서버에서 메시지를 다시 가져옵니다.

      } else {
        throw new Error('메시지를 보내는 과정에서 오류가 났다.');
      }

    } catch (error) {

      console.error('Error:', error); // 오류를 콘솔에 기록한다.
      alert('서버와 통신 중 문제가 발생했습니다.'); // 사용자에게 알림으로 표시한다.
    }
  };

  return ( // 이 컴포넌트가 렌더링할 JSX를 반환한다.
    <div className="container">
      <div className="chat-container">
        <div className="chat-header">Chatbot AI</div>
        <div className="chat-messages">
          {messages.map((msg, index) => ( // messages 배열을 순회하여 각 메시지를 화면에 렌더링 한다.
            <div key={index} className={`message ${msg.sender === userNickname ? 'user' : 'bot'}`}>
              {/* 메시지의 sender가 현재 사용자 닉네임과 같으면 user 클래스, 다르면 bot 클래스 */}
              <div className="message-content">
                {msg.sender !== userNickname && <img src={botImage} alt="bot" />}
                {/* 메시지 sender가 현재 사용자와 같지 않으면 로봇 이미지를 출력한다. */}
                <div className="message-content-text">
                  <div className="sender">{msg.sender}</div>
                  <div className="text">{msg.text}</div>
                  <div className="timestamp">{formatTimestamp(msg.timestamp)}</div>
                  {/* 메시지의 타임스탬프를 포맷하여 표시합니다. */}
                </div>
                {msg.sender === userNickname && <img src={userImage} alt="user" />}
                {/* 메시지가 userNickname이랑 같으면 사용자 이미지를 표시한다. */}
              </div>
            </div>
          ))}
        </div>
        <div className="chat-input">
          <input
            type="text"
            placeholder="메시지를 작성해 주세요...."
            value={inputMessage} // inputMessage 상태에 바인딩되어 있으며, 입력값이 변경되면 setInputMessage 함수로 상태를 업데이트한다.
            onChange={(e) => setInputMessage(e.target.value)}
            //입력 필드의 값 value, inputMessage 상태를 설정하고, 입력 필드에 입력할 때마다
            //inputMessage 상태를 업데이트 한다. placeholder는 입력하기 전엔 필드에 나타나는 안내 텍스트 설정
            // onChange 핸들러는 사용자의 입력 변경을 처리하여 상태를 동기화합니다.
          />
          <button onClick={sendMessage}>메시지 보내기</button>
          {/* sendMessage 함수를 호출하여 메시지를 서버로 전송한다. */}
        </div>
      </div>
    </div>
  );
}

export default Second;
