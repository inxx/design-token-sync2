const { Octokit } = require('@octokit/rest');
const fs = require('fs');
const path = require('path');

class GitHubService {
  constructor() {
    this.octokit = new Octokit({
      auth: process.env.GITHUB_TOKEN
    });
    this.owner = process.env.GITHUB_OWNER;
    this.repo = process.env.GITHUB_REPO;
    this.baseBranch = process.env.GITHUB_BRANCH || 'main';
  }

  async createPR(tokenFile, outputFiles) {
    try {
      const branchName = `design-tokens/update-${Date.now()}`;
      
      // 새 브랜치 생성
      await this.createBranch(branchName);
      
      // 파일들을 새 브랜치에 커밋
      await this.commitFiles(branchName, tokenFile, outputFiles);
      
      // PR 생성
      const pr = await this.octokit.rest.pulls.create({
        owner: this.owner,
        repo: this.repo,
        title: '🎨 Design Token Update',
        head: branchName,
        base: this.baseBranch,
        body: this.generatePRBody(tokenFile, outputFiles)
      });

      // 라벨 추가
      await this.octokit.rest.issues.addLabels({
        owner: this.owner,
        repo: this.repo,
        issue_number: pr.data.number,
        labels: ['design-tokens', 'auto-generated']
      });

      return {
        success: true,
        prUrl: pr.data.html_url,
        prNumber: pr.data.number
      };
    } catch (error) {
      console.error('PR 생성 중 오류:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async createBranch(branchName) {
    // 베이스 브랜치의 최신 커밋 가져오기
    const { data: ref } = await this.octokit.rest.git.getRef({
      owner: this.owner,
      repo: this.repo,
      ref: `heads/${this.baseBranch}`
    });

    // 새 브랜치 생성
    await this.octokit.rest.git.createRef({
      owner: this.owner,
      repo: this.repo,
      ref: `refs/heads/${branchName}`,
      sha: ref.object.sha
    });
  }

  async commitFiles(branchName, tokenFile, outputFiles) {
    const files = [tokenFile, ...outputFiles];
    
    for (const file of files) {
      if (fs.existsSync(file)) {
        const content = fs.readFileSync(file, 'utf8');
        const encodedContent = Buffer.from(content).toString('base64');
        
        await this.octokit.rest.repos.createOrUpdateFileContents({
          owner: this.owner,
          repo: this.repo,
          path: file,
          message: `Update ${path.basename(file)}`,
          content: encodedContent,
          branch: branchName
        });
      }
    }
  }

  generatePRBody(tokenFile, outputFiles) {
    return `## 🎨 Design Token Changes

이 PR은 디자인 토큰 변경사항을 포함합니다.

### 변경된 파일들:

**Token File:**
- ${tokenFile}

**Generated Files:**
${outputFiles.map(file => `- ${file}`).join('\n')}

### 변경 사항:
- Figma에서 새로운 디자인 토큰이 업로드되었습니다
- style-dictionary를 통해 CSS, SCSS, JS 파일이 생성되었습니다

---

🤖 이 PR은 자동으로 생성되었습니다.`;
  }

  async getFilesDiff(files) {
    const diffs = [];
    
    for (const file of files) {
      try {
        const { data } = await this.octokit.rest.repos.getContent({
          owner: this.owner,
          repo: this.repo,
          path: file,
          ref: this.baseBranch
        });
        
        const currentContent = Buffer.from(data.content, 'base64').toString();
        const newContent = fs.readFileSync(file, 'utf8');
        
        if (currentContent !== newContent) {
          diffs.push(file);
        }
      } catch (error) {
        // 파일이 존재하지 않는 경우 (새 파일)
        diffs.push(file);
      }
    }
    
    return diffs;
  }
}

module.exports = GitHubService;