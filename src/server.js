const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const TokenProcessor = require('./tokenProcessor');
const GitHubService = require('./githubService');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const tokenProcessor = new TokenProcessor();
const githubService = new GitHubService();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Multer 설정 - 업로드된 파일을 uploads 폴더에 저장
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `tokens-${Date.now()}.json`);
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/json') {
      cb(null, true);
    } else {
      cb(new Error('JSON 파일만 업로드 가능합니다.'), false);
    }
  }
});

// 라우트
app.get('/', (req, res) => {
  res.json({ 
    message: 'Design Token Sync Server',
    endpoints: {
      upload: 'POST /upload',
      build: 'POST /build-css',
      status: 'GET /status'
    }
  });
});

app.get('/status', (req, res) => {
  res.json({ status: 'running', timestamp: new Date().toISOString() });
});

// 파일 업로드 엔드포인트
app.post('/upload', upload.single('tokens'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: '파일이 업로드되지 않았습니다.' });
  }
  
  res.json({
    message: '파일이 성공적으로 업로드되었습니다.',
    filename: req.file.filename,
    path: req.file.path
  });
});

// CSS 빌드 엔드포인트
app.post('/build-css', async (req, res) => {
  const { filename } = req.body;
  
  if (!filename) {
    return res.status(400).json({ error: '파일명이 필요합니다.' });
  }
  
  const filePath = path.join('uploads', filename);
  
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: '파일을 찾을 수 없습니다.' });
  }
  
  try {
    const result = await tokenProcessor.processTokens(filePath);
    
    if (result.success) {
      // CSS 빌드가 성공하면 GitHub PR 생성
      const prResult = await githubService.createPR(filePath, result.outputFiles);
      result.pr = prResult;
    }
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ 
      error: 'CSS 빌드 중 오류가 발생했습니다.',
      message: error.message 
    });
  }
});

// 에러 핸들링
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    return res.status(400).json({ error: error.message });
  }
  res.status(500).json({ error: error.message });
});

app.listen(PORT, () => {
  console.log(`서버가 포트 ${PORT}에서 실행 중입니다.`);
});