const express = require('express');        // Node.js 프레임워크로, 서버와 라우팅 기능을 한다.
const bodyParser = require('body-parser'); // 요청 본문을 JSON 형식으로  파싱하는 미들웨어
const cors = require('cors');              // 다른 도메인에서 오는 요청을 허용한다.
const path = require('path');              // 파일 및 디렉토리 경로를 조작하는 유틸리티
const { GoogleGenerativeAI } = require('@google/generative-ai'); // Google Gemini API 클라이언트 라이브러리
require('dotenv').config();                // .env 파일에서 환경 변수 로드
const fs = require('fs');


const app = express();  // Express 애플리케이션 인스턴스를 생성합니다.
const port = 5001;      // 서버가 청취할 포트번호 설정

// Middleware
app.use(cors());                        // 모든 도메인 요청을 허용한다.
app.use(bodyParser.json());             // JSON 형식의 요청 본문을 파싱한다.
app.use(bodyParser.urlencoded({ extended: true }));  // URL 인코딩된 데이터를 파싱한다.

// Google Gemini API 클라이언트 설정
const genAI = new GoogleGenerativeAI(process.env.API_KEY);

// 정적파일을 제공하기 위한 미들웨어, React 애플리케이션의 빌드된 파일을 서빙한다.
app.use(express.static(path.join(__dirname, '../frontend/build')));

let messages = [];   // 서버에 저장된 메시지 목록입니다.
let users = [];      // 가입된 사용자 목록입니다.

app.post('/join', (req, res) => {    // '/join' 경로에 대한 POST 요청을 처리하기 위한 엔드포인트를 정의
  const { nickname } = req.body;     // 'req.body'에서 nickname 속성을 추출하여 'nickname' 변수에 할당한다.
  if (nickname && !users.includes(nickname)) {  // nickname이 존재하고 user목록에 닉네임이 없으면 닉네임 추가.
    users.push(nickname);
    res.status(200).send({ message: '사용자가 성공적으로 가입' }); // 클라이언트에게 HTTP 상태코드 반환,
                                                                   // message 응답으로 보냄
  } else {
    res.status(400).send({ message: '이미 사용중인 닉네임 입니다.' });
  }
});

app.post('/change-nickname', (req, res) => { // '/change-nickname' 경로에 대한 POST 요청을 처리하기 위한 엔드포인트 정의
  const { nickname } = req.body;             // req.body에서 nickname 속성을 추출하여 nickname 변수에 할당.
  if (nickname) {           // 닉네임이 있으면 다음 실행
    messages = [];          // 메시지를 빈 배열로 초기화한다.
    if (!users.includes(nickname)) { // 닉네임이 포함이 안되있으면
      users.push(nickname);          // nickname을 추가한다.
    }
    res.status(200).send({ message: '닉네임이 성공적으로 바뀌었습니다.' });
  } else {
    res.status(400).send({ message: '닉네임이 필요합니다.' });
  }
});

app.post('/send-message', async (req, res) => {  // '/send-message' 경로안에서 POST 요청을 보내면, 콜백함수가 실행
  const { sender, text } = req.body;  // sender 와 text 속성을 추출하여 각각 sender 와 text 변수에 할당.
  if (sender && text) {     // sender 와 text가 모두 존재하는 경우에만 다음 블록 실행
    const timestamp = new Date().toISOString(); // 현재 시간을 로컬 시간 형식의 문자열로 생성하여 timestamp 변수에 할당
    messages.push({ sender, text, timestamp }); // sender , text, timestamp 를 메시지 변수에 할당한다.

    try {
      // genAI 인스턴스를 사용해 'gemini-pro' 모델을 가져옵니다.
      const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
      // 모델에 입력 텍스트를 주고 스트리밍 방식으로 결과를 생성합니다.
      const result = await model.generateContentStream([text]);

      // responseText 변수 초기화
      let responseText = '';

      // 스트림에서 데이터를 받아와서 responseText에 추가합니다.
      for await (const chunk of result.stream) {
        responseText += chunk.text();
      }

      // message 배열에 AI 응답을 추가합니다.
      messages.push({
        sender: 'AI BOT',    // 발신자 : AI BOT
        text: responseText.trim(), // AI 응답 텍스트
        timestamp: new Date().toISOString() // 현재 시간을 ISO 형식으로 추가
      });

      res.status(200).send(messages); // 클라이언트에게 HTTP 상태 코드를 반환, 모든 메시지는 json형식으로 응답
    } catch (error) {

      //예외 발생 시 콘솔에 에러 메시지를 기록합니다.
      console.error('Google Gemini API 와 통신하는 중 장애가 발생:', error);

      // 클라이언트에게 HTTP 500 상태 코드와 함께 여러 메시지를 반환합니다.
      res.status(500).send({ message: 'Google Gemini 연결 실패' });
    }
  } else {
    // sender 와 text가 없는 경우 클라이언트에게 HTTP 400 상태 코드와 함께 여러 메시지를 반환
    res.status(400).send({ message: 'Error : sender , text 필요' });
  }
});

app.get('/messages', (req, res) => { // '/messages' 경로에 GET 요청을 보내고 응답을 받는다. json 형식으로
  res.status(200).send(messages);
});

app.get('*', (req, res) => {  // '*' 모든 경로에서 GET 요청을 처리하기 위해 엔드포인트를 정의.
  res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
  // 클라이언트에게 index.html을 응답으로 보낸다. 이 파일은 fronted/build 디렉토리 안에 있는 파일이다.
  // 현재 디렉토리 dirname 기준으로 frontend/build 디렉토리 안에 있는 index.html 파일의 경로를 생성한다.
});

app.listen(port, () => { // 서버를 지정된 포트에서 시작된다. 포트는 5001로 설정
  console.log(`Server running at http://localhost:${port}`);
  // 서버가 성공적으로 시작되면, 콘솔에 서버가 실행중이라는 메시지와 서버의 주소 출력
});
