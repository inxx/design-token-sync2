const StyleDictionary = require('style-dictionary');
const fs = require('fs');
const path = require('path');

class TokenProcessor {
  constructor() {
    this.setupStyleDictionary();
  }

  setupStyleDictionary() {
    // 커스텀 변환 함수들 등록
    StyleDictionary.registerTransform({
      name: 'size/px',
      type: 'value',
      matcher: (token) => {
        return token.attributes.category === 'size';
      },
      transformer: (token) => {
        return parseFloat(token.original.value) + 'px';
      }
    });

    StyleDictionary.registerTransform({
      name: 'color/css',
      type: 'value',
      matcher: (token) => {
        return token.attributes.category === 'color';
      },
      transformer: (token) => {
        return token.original.value;
      }
    });
  }

  async processTokens(inputFile) {
    try {
      // 업로드된 토큰 파일 검증
      const tokenData = JSON.parse(fs.readFileSync(inputFile, 'utf8'));
      
      // style-dictionary 설정 생성
      const config = {
        source: [inputFile],
        platforms: {
          css: {
            transformGroup: 'css',
            buildPath: 'output/',
            files: [{
              destination: 'tokens.css',
              format: 'css/variables'
            }]
          },
          scss: {
            transformGroup: 'scss',
            buildPath: 'output/',
            files: [{
              destination: 'tokens.scss',
              format: 'scss/variables'
            }]
          },
          js: {
            transformGroup: 'js',
            buildPath: 'output/',
            files: [{
              destination: 'tokens.js',
              format: 'javascript/es6'
            }]
          }
        }
      };

      // style-dictionary 빌드 실행
      const StyleDictionaryExtended = StyleDictionary.extend(config);
      await StyleDictionaryExtended.buildAllPlatforms();

      return {
        success: true,
        message: 'CSS 파일이 성공적으로 생성되었습니다.',
        outputFiles: [
          'output/tokens.css',
          'output/tokens.scss',
          'output/tokens.js'
        ]
      };
    } catch (error) {
      console.error('토큰 처리 중 오류:', error);
      return {
        success: false,
        message: '토큰 처리 중 오류가 발생했습니다.',
        error: error.message
      };
    }
  }

  // Figma 토큰 형식을 style-dictionary 형식으로 변환
  transformFigmaTokens(figmaTokens) {
    const transformed = {};
    
    Object.keys(figmaTokens).forEach(category => {
      transformed[category] = {};
      Object.keys(figmaTokens[category]).forEach(tokenName => {
        const token = figmaTokens[category][tokenName];
        transformed[category][tokenName] = {
          value: token.value,
          type: token.type || 'other',
          description: token.description || ''
        };
      });
    });
    
    return transformed;
  }
}

module.exports = TokenProcessor;